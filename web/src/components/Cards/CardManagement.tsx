import React, { useState, useEffect, useRef } from 'react';
import { cardService } from '../../services/card.service';
import type { CreditCard, UserCard } from '../../types';
import { CreditCard as CreditCardIcon, Plus, Trash2, Check, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import PageLayout, { PageLoading } from '../Layout/PageLayout';

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
        cardService.getCardRewards(),
      ]);

      if (cardsResponse.success && cardsResponse.data) {
        setAllCards(cardsResponse.data);
      }

      if (userCardsResponse.success && userCardsResponse.data) {
        setUserCards(userCardsResponse.data);
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
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorMsg =
          typeof response.error === 'string'
            ? response.error
            : response.error?.message || 'Failed to add card';
        setError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || 'Failed to add card. You may already have this card.';
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
        is_active: !userCard.is_active,
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

  const scrollToAvailable = () => {
    availableCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isCardInWallet = (cardId: number) => {
    return userCards.some((uc) => uc.card === cardId);
  };

  const getUserCardDetails = (cardId: number): CreditCard | undefined => {
    return allCards.find((c) => c.id === cardId);
  };

  const formatIssuer = (issuer: string) => {
    return issuer
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getCategoryDisplay = (category: string | string[]) => {
    const categoryStr = Array.isArray(category) ? category.join(', ') : category;

    if (categoryStr.includes(',')) {
      return categoryStr
        .split(',')
        .map((cat) =>
          cat
            .trim()
            .split('_')
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ')
        )
        .join(', ');
    }

    return categoryStr
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const renderCardMeta = (card: CreditCard) => (
    <div className="wallet-card-rows">
      <div className="wallet-card-row">
        <span className="wallet-card-row-label">Annual Fee</span>
        <span className="wallet-card-row-value">${card.annual_fee}</span>
      </div>
      <div className="wallet-card-row">
        <span className="wallet-card-row-label">Foreign Transaction Fee</span>
        <span className={`wallet-card-row-value ${card.ftf ? 'text-red-600' : 'text-green-600'}`}>
          {card.ftf ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );

  const renderRewardRules = (card: CreditCard, limit?: number) => {
    if (!card.reward_rules?.length) return null;

    const rules = limit ? card.reward_rules.slice(0, limit) : card.reward_rules;
    const remaining = limit ? card.reward_rules.length - limit : 0;

    return (
      <div>
        <h4 className="wallet-card-rewards-title">Rewards</h4>
        <div className="wallet-card-rewards-list">
          {rules.map((rule, idx) => (
            <div key={idx} className="wallet-card-reward-item">
              {rule.multiplier}x on {getCategoryDisplay(rule.category as string)}
              {rule.cap_amount ? ` (Cap: $${rule.cap_amount})` : ''}
            </div>
          ))}
          {remaining > 0 && (
            <div className="wallet-card-reward-more">+{remaining} more...</div>
          )}
        </div>
      </div>
    );
  };

  const availableCards = allCards.filter((card) => !isCardInWallet(card.id));

  if (loading) {
    return <PageLoading message="Loading cards..." />;
  }

  return (
    <PageLayout
      title="Card Management"
      subtitle="Manage your credit cards and maximize your rewards"
      maxWidth="7xl"
    >
      {error && (
        <div className="page-alert page-alert--error flex justify-between items-center gap-2">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="page-alert page-alert--success flex justify-between items-center gap-2">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} className="text-green-700">
            <X size={18} />
          </button>
        </div>
      )}

      <section className="page-section">
        <div className="page-section-header">
          <h2 className="page-section-title">My Cards</h2>
          <button
            type="button"
            onClick={scrollToAvailable}
            className="page-btn page-btn-primary inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Browse & Add Cards
          </button>
        </div>

        {userCards.length === 0 ? (
          <div className="page-card">
            <div className="page-empty-state">
              <div className="page-empty-state-icon" style={{ backgroundColor: '#ede9fe', color: '#5e17eb' }}>
                <CreditCardIcon size={26} />
              </div>
              <h3>No cards yet</h3>
              <p>Add your credit cards to start optimizing your rewards!</p>
              <button
                type="button"
                onClick={scrollToAvailable}
                className="page-btn page-btn-primary inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Add Your First Card
              </button>
            </div>
          </div>
        ) : (
          <div className="wallet-card-grid">
            {userCards.map((userCard) => {
              const cardDetails = getUserCardDetails(userCard.card);
              if (!cardDetails) return null;

              return (
                <article
                  key={userCard.id}
                  className={`wallet-card ${
                    userCard.is_active ? 'wallet-card--active' : 'wallet-card--inactive'
                  }`}
                >
                  <div className="wallet-card-top">
                    <div className="min-w-0">
                      <p className="wallet-card-bank">{formatIssuer(cardDetails.issuer)}</p>
                      <h3 className="wallet-card-name">
                        {cardDetails.name}
                        <span
                          className={`wallet-status-badge ${
                            userCard.is_active
                              ? 'wallet-status-badge--active'
                              : 'wallet-status-badge--inactive'
                          }`}
                        >
                          {userCard.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </h3>
                    </div>
                    <CreditCardIcon
                      size={22}
                      className={userCard.is_active ? 'wallet-card-icon' : 'wallet-card-icon--muted'}
                    />
                  </div>

                  {renderCardMeta(cardDetails)}
                  {renderRewardRules(cardDetails, 3)}

                  {userCard.notes && (
                    <div className="wallet-card-notes">
                      <strong>Notes:</strong> {userCard.notes}
                    </div>
                  )}

                  <div className="wallet-card-rewards-earned">
                    <span className="wallet-card-rewards-earned-label">Rewards This Month</span>
                    <span className="wallet-card-rewards-earned-value">
                      {formatCurrency(cardRewards[userCard.card] || 0)}
                    </span>
                  </div>

                  <div className="wallet-card-actions">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(userCard)}
                      className="page-btn page-btn-secondary"
                    >
                      {userCard.is_active ? (
                        <>
                          <X size={14} />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(userCard.id)}
                      className="page-btn page-btn-danger page-btn-icon"
                      aria-label="Remove card"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section ref={availableCardsRef} className="page-section">
        <h2 className="page-section-title">Available Cards</h2>
        <p className="page-subtitle" style={{ marginTop: '-0.25rem', marginBottom: '1rem' }}>
          Browse our database of credit cards to find the best fit for you
        </p>

        {availableCards.length === 0 ? (
          <div className="page-card">
            <div className="page-empty-state">
              <h3>All cards added</h3>
              <p>You&apos;ve already added all available cards to your wallet.</p>
            </div>
          </div>
        ) : (
          <div className="wallet-card-grid">
            {availableCards.map((card) => (
              <article key={card.id} className="wallet-card wallet-card--available">
                <div className="wallet-card-top">
                  <div className="min-w-0">
                    <p className="wallet-card-bank">{formatIssuer(card.issuer)}</p>
                    <h3 className="wallet-card-name">{card.name}</h3>
                  </div>
                  <CreditCardIcon size={22} className="wallet-card-icon" />
                </div>

                {renderCardMeta(card)}
                {renderRewardRules(card, 4)}

                {(card.benefits?.[0]?.benefits?.length ?? 0) > 0 && (
                  <div>
                    <h4 className="wallet-card-rewards-title">Benefits</h4>
                    <div className="wallet-card-rewards-list">
                      {card.benefits?.[0]?.benefits.slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="wallet-card-reward-item">
                          ✓ {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCard(card);
                    setNotes('');
                  }}
                  className="page-btn page-btn-primary w-full"
                  style={{ marginTop: 'auto' }}
                >
                  <Plus size={16} />
                  Add to Wallet
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedCard && (
        <div ref={addCardPanelRef} className="wallet-add-panel">
          <div className="page-card">
            <div className="page-card-header">
              <h3 className="text-lg font-semibold text-gray-900">Add Card to Wallet</h3>
            </div>
            <div className="page-card-body">
              <div className="page-info-box" style={{ marginBottom: '1rem' }}>
                <p style={{ fontWeight: 600, color: '#312e81' }}>{selectedCard.name}</p>
                <p style={{ marginTop: '0.25rem' }}>{formatIssuer(selectedCard.issuer)}</p>
              </div>

              <div className="form-field">
                <label htmlFor="card-notes">Notes (Optional)</label>
                <textarea
                  id="card-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add personal notes about this card..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCard(null);
                    setNotes('');
                  }}
                  className="page-btn page-btn-secondary"
                >
                  Cancel
                </button>
                <button type="button" onClick={handleAddCard} className="page-btn page-btn-primary">
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default CardManagement;
