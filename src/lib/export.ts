import { Chat } from '@/types';

export const exportChats = (chats: Chat[]) => {
  const dataStr = JSON.stringify(chats, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `r1-chats-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importChats = (file: File): Promise<Chat[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedChats = JSON.parse(content);
        
        // Validate the structure
        if (!Array.isArray(importedChats)) {
          throw new Error('Invalid chat export format');
        }
        
        // Convert date strings back to Date objects
        const validatedChats: Chat[] = importedChats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        
        resolve(validatedChats);
      } catch (error) {
        reject(new Error('Failed to parse chat export file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export const exportChatAsMarkdown = (chat: Chat) => {
  let markdown = `# ${chat.title}\n\n`;
  markdown += `**Created:** ${chat.createdAt.toLocaleString()}\n`;
  markdown += `**Model:** ${chat.model}\n`;
  markdown += `**Messages:** ${chat.messages.length}\n\n`;
  markdown += '---\n\n';
  
  chat.messages.forEach((message, index) => {
    const role = message.role === 'user' ? '👤 **User**' : '🤖 **Assistant**';
    const timestamp = message.timestamp.toLocaleString();
    
    markdown += `## ${role} - ${timestamp}\n\n`;
    markdown += `${message.content}\n\n`;
    
    if (index < chat.messages.length - 1) {
      markdown += '---\n\n';
    }
  });
  
  const dataUri = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdown);
  const exportFileDefaultName = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};
