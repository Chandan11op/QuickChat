import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

const MessageBubble = ({ message, isMe }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`max-w-[70%] relative ${isMe ? 'order-1' : 'order-2'}`}>
        <div 
          className={`px-4 py-2.5 rounded-2xl shadow-sm ${
            isMe 
            ? 'bg-accent text-white rounded-br-none' 
            : 'bg-background-tertiary border border-glass-border text-text-primary rounded-bl-none'
          }`}
        >
          {message.type === 'image' && (
            <img 
              src={message.fileUrl} 
              alt="Shared content" 
              className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
            />
          )}
          
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[9px] font-medium ${isMe ? 'text-white/70' : 'text-text-secondary'}`}>
              {format(new Date(message.createdAt || Date.now()), 'HH:mm')}
            </span>
            {isMe && (
              <span className="text-white/70">
                {message.status === 'seen' ? (
                  <CheckCheck size={12} className="text-blue-200" />
                ) : (
                  <Check size={12} />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;