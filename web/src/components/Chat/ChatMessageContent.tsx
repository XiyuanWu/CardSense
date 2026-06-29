import React from 'react';

/** Inline **bold** (and *italic*) without extra dependencies. */
function formatInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

interface ChatMessageContentProps {
  text: string;
  className?: string;
}

/**
 * Renders assistant-style markdown: paragraphs, numbered lists, bullets, **bold**.
 */
export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({
  text,
  className = '',
}) => {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let key = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      blocks.push(<br key={key++} />);
      return;
    }

    const numbered = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numbered) {
      blocks.push(
        <p key={key++} className="chat-md-line chat-md-line--numbered">
          <span className="chat-md-num">{numbered[1]}.</span>{' '}
          {formatInline(numbered[2])}
        </p>,
      );
      return;
    }

    const bullet = trimmed.match(/^[-*•]\s+(.+)/);
    if (bullet) {
      blocks.push(
        <p key={key++} className="chat-md-line chat-md-line--bullet">
          {formatInline(bullet[1])}
        </p>,
      );
      return;
    }

    blocks.push(
      <p key={key++} className="chat-md-line">
        {formatInline(trimmed)}
      </p>,
    );
  });

  return <div className={`chat-md ${className}`.trim()}>{blocks}</div>;
};

export default ChatMessageContent;
