'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message as MessageType } from '@/types';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
}

export const Message = React.memo(function Message({ message, isLast }: MessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div 
      id={`message-${message.id}`}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group scroll-mt-4`}
    >
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-600 text-white ml-3' 
            : 'bg-gray-700 text-gray-300 mr-3'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message content */}
        <div className={`rounded-lg p-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-800 text-gray-100'
        }`}>
          <div className="break-words">
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark as any}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md !mt-2 !mb-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }: any) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }: any) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }: any) => <li className="ml-2">{children}</li>,
                    h1: ({ children }: any) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                    h2: ({ children }: any) => <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                    h3: ({ children }: any) => <h3 className="text-base font-bold mb-2 mt-2 first:mt-0">{children}</h3>,
                    blockquote: ({ children }: any) => (
                      <blockquote className="border-l-4 border-gray-600 pl-4 italic my-2">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }: any) => (
                      <div className="overflow-x-auto my-2">
                        <table className="min-w-full border border-gray-600">{children}</table>
                      </div>
                    ),
                    th: ({ children }: any) => (
                      <th className="border border-gray-600 px-3 py-2 bg-gray-700 font-semibold text-left">
                        {children}
                      </th>
                    ),
                    td: ({ children }: any) => (
                      <td className="border border-gray-600 px-3 py-2">{children}</td>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            {message.isStreaming && (
              <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
            )}
          </div>
          
          {message.error && (
            <div className="mt-2 text-red-400 text-sm">
              Error: {message.error}
            </div>
          )}

          {/* Message actions */}
          {!isUser && !message.isStreaming && (
            <div className="flex items-center justify-end mt-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyToClipboard}
                className="p-1 rounded hover:bg-gray-700 transition-colors"
                title="Copy message"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
              <button
                className="p-1 rounded hover:bg-gray-700 transition-colors"
                title="Good response"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-700 transition-colors"
                title="Bad response"
              >
                <ThumbsDown size={14} />
              </button>
            </div>
          )}

          {/* Timestamp and model info */}
          <div className={`text-xs mt-2 ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}>
            {message.model && !isUser && (
              <span className="mr-2">{message.model}</span>
            )}
            <span>{message.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
