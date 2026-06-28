import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cardService } from '../../services/card.service';
import type { CreditCard, UserCard } from '../../types';
import { CreditCard as CreditCardIcon, Plus, Trash2, Check, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CardManagement: React.FC = () => {
  const [allCards, setAllCards] = useState<CreditCard[]>([]);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [cardRewards, setCardRewards] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const availableCardsRef = useRef<HTMLDivElement | null>(null);
  const addCardPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCard && addCardPanelRef.current) {
      addCardPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCard]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cardsResponse, userCardsResponse, rewardsResponse] = await Promise.all([
        cardService.getAllCards(),
        cardService.getUserCards(),
        cardService.getCardRewards()
      ]);

      console.log('Cards API response:', cardsResponse);
      console.log('User cards API response:', userCardsResponse);
      console.log('Rewards API response:', rewardsResponse);

      if (cardsResponse.success && cardsResponse.data) {
        console.log('Setting all cards:', cardsResponse.data.length, 'cards');
        setAllCards(cardsResponse.data);
      } else {
        console.error('Cards API failed:', cardsResponse);
      }

      if (userCardsResponse.success && userCardsResponse.data) {
        console.log('Setting user cards:', userCardsResponse.data.length, 'cards');
        setUserCards(userCardsResponse.data);
      } else {
        console.log('User cards API response (not error):', userCardsResponse);
      }

      if (rewardsResponse.success && rewardsResponse.data) {
        const rewardsMap: Record<number, number> = {};
        rewardsResponse.data.forEach((item: any) => {
          rewardsMap[item.card_id] = item.rewards_earned;
        });
        setCardRewards(rewardsMap);
      }
    } catch (err) {
      setError('Failed to load cards. Please try again.');
      console.error('Error loading cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!selectedCard) {
      return;
    }

    try {
      setError('');
      const response = await cardService.addUserCard(selectedCard.id, notes);
      
      if (response.success) {
        setSuccess('Card added successfully!');
        setSelectedCard(null);
        setNotes('');
        loadData(); // Reload to get updated list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorMsg = typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to add card';
        console.error('API returned error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to add card. You may already have this card.';
      console.error('Exception adding card:', err, 'Error message:', errorMsg);
      setError(errorMsg);
    }
  };

  const handleRemoveCard = async (userCardId: number) => {
    if (!window.confirm('Are you sure you want to remove this card from your wallet?')) {
      return;
    }

    try {
      setError('');
      const response = await cardService.removeUserCard(userCardId);
      
      if (response.success) {
        setSuccess('Card removed successfully!');
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to remove card');
      }
    } catch (err) {
      setError('Failed to remove card. Please try again.');
      console.error('Error removing card:', err);
    }
  };

  const handleToggleActive = async (userCard: UserCard) => {
    try {
      setError('');
      const response = await cardService.updateUserCard(userCard.id, {
        is_active: !userCard.is_active
      });
      
      if (response.success) {
        setSuccess(`Card ${!userCard.is_active ? 'activated' : 'deactivated'}!`);
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update card status');
      }
    } catch (err) {
      setError('Failed to update card. Please try again.');
      console.error('Error updating card:', err);
    }
  };

  const isCardInWallet = (cardId: number) => {
    return userCards.some(uc => uc.card === cardId);
  };

  const getUserCardDetails = (cardId: number): CreditCard | undefined => {
    return allCards.find(c => c.id === cardId);
  };

  const formatIssuer = (issuer: string) => {
    return issuer.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getCategoryDisplay = (category: string | string[]) => {
    // Handle both string and array formats
    const categoryStr = Array.isArray(category) ? category.join(', ') : category;
    
    // If it's a comma-separated list, split and format each part
    if (categoryStr.includes(',')) {
      return categoryStr.split(',').map(cat => 
        cat.trim().split('_').map(word => 
          word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ')
      ).join(', ');
    }
    
    // Single category
    return categoryStr.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const availableCards = allCards.filter((card) => !isCardInWallet(card.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-16">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Card Management</h1>
            <p className="text-gray-600">Manage your credit cards and maximize your rewards</p>
          </div>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <X size={20} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
              <X size={20} />
            </button>
          </div>
        )}

        {/* My Cards Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">My Cards</h2>
            <button
              onClick={() => {
                if (availableCardsRef.current) {
                  availableCardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} className="mr-2" />
              Browse & Add Cards
            </button>
          </div>

          {userCards.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <CreditCardIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No cards yet</h3>
              <p className="text-gray-600 mb-4">Add your credit cards to start optimizing your rewards!</p>
              <button
                onClick={() => {
                  if (availableCardsRef.current) {
                    availableCardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} className="mr-2" />
                Add Your First Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userCards.map((userCard) => {
                const cardDetails = getUserCardDetails(userCard.card);
                if (!cardDetails) return null;

                return (
                  <div
                    key={userCard.id}
                    className={`bg-white rounded-lg shadow-lg p-6 border-2 transition ${
                      userCard.is_active ? 'border-blue-500' : 'border-gray-300 opacity-60'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{cardDetails.name}</h3>
                        <p className="text-sm text-gray-600">{formatIssuer(cardDetails.issuer)}</p>
                      </div>
                      <CreditCardIcon className={userCard.is_active ? 'text-blue-600' : 'text-gray-400'} size={32} />
                    </div>

                    {/* Card Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Annual Fee:</span>
                        <span className="font-semibold">${cardDetails.annual_fee}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Foreign Transaction Fee:</span>
                        <span className={cardDetails.ftf ? 'text-red-600' : 'text-green-600'}>
                          {cardDetails.ftf ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    {/* Reward Rules */}
                    {cardDetails.reward_rules && cardDetails.reward_rules.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Rewards:</h4>
                        <div className="space-y-1">
                          {cardDetails.reward_rules.slice(0, 3).map((rule, idx) => (
                            <div key={idx} className="text-xs text-gray-600 flex items-start">
                              <span className="text-green-600 mr-1">•</span>
                              <span>
                                {rule.multiplier}x on {getCategoryDisplay(rule.category as string)}
                                {rule.cap_amount && ` (Cap: $${rule.cap_amount})`}
                              </span>
                            </div>
                          ))}
                          {cardDetails.reward_rules.length > 3 && (
                            <div className="text-xs text-blue-600">
                              +{cardDetails.reward_rules.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* User Notes */}
                    {userCard.notes && (
                      <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        <span className="font-semibold">Notes:</span> {userCard.notes}
                      </div>
                    )}

                    {/* Rewards Earned */}
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-green-900">Rewards This Month:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(cardRewards[userCard.card] || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t">
                      <button
                        onClick={() => handleToggleActive(userCard)}
                        className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                          userCard.is_active
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {userCard.is_active ? (
                          <>
                            <X size={16} className="mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Check size={16} className="mr-1" />
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveCard(userCard.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Cards Section */}
        <div ref={availableCardsRef} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Cards</h2>
          <p className="text-gray-600 mb-6">
            Browse our database of credit cards to find the best fit for you
          </p>

          {availableCards.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
              You’ve already added all available cards to your wallet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {availableCards.map((card) => (
                <div
                  key={card.id}
                  className={`bg-white rounded-lg shadow p-6 border transition ${
                    'border-gray-200 hover:border-blue-400'
                  }`}
                >
                    <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{card.name}</h3>
                      <p className="text-sm text-gray-600">{formatIssuer(card.issuer)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Annual Fee:</span>
                      <span className="font-semibold">${card.annual_fee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Foreign Transaction Fee:</span>
                      <span className={card.ftf ? 'text-red-600' : 'text-green-600'}>
                        {card.ftf ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  {/* Reward Rules */}
                  {card.reward_rules && card.reward_rules.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Rewards:</h4>
                      <div className="space-y-1">
                        {card.reward_rules.map((rule, idx) => (
                          <div key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="text-green-600 mr-1">•</span>
                            <span>
                              {rule.multiplier}x on {getCategoryDisplay(rule.category as string)}
                              {rule.cap_amount && ` (Cap: $${rule.cap_amount})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {card.benefits && card.benefits.length > 0 && card.benefits[0].benefits.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Benefits:</h4>
                      <div className="space-y-1">
                        {card.benefits[0].benefits.slice(0, 2).map((benefit, idx) => (
                          <div key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="text-blue-600 mr-1">✓</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setNotes('');
                    }}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <Plus size={18} className="mr-2" />
                    Add to Wallet
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Card Panel */}
        {selectedCard && (
          <div ref={addCardPanelRef} className="mt-2 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Card to Wallet</h3>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="font-semibold text-gray-900">{selectedCard.name}</p>
                <p className="text-sm text-gray-600">{formatIssuer(selectedCard.issuer)}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add personal notes about this card..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedCard(null);
                    setNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCard}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardManagement;

