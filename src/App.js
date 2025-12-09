import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // 지식 베이스 상태 (빈 상태로 시작)
  const [knowledgeBase, setKnowledgeBase] = useState(() => {
    const saved = localStorage.getItem('chatbot-knowledge-samsung');
    return saved ? JSON.parse(saved) : [];
  });
  
  // 채팅 상태
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello, I\'m Samsung.com AI Chatbot. Feel free to ask me anything related to Samsung.com!',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({ title: '', content: '' });
  
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // 로컬 스토리지에 지식 베이스 저장
  useEffect(() => {
    localStorage.setItem('chatbot-knowledge-samsung', JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  // 채팅 스크롤 자동 이동
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 지식 베이스에서 관련 정보 검색
  const searchKnowledge = (query) => {
    const queryWords = query.toLowerCase().split(/\s+/);
    let bestMatch = null;
    let highestScore = 0;

    knowledgeBase.forEach(item => {
      const titleWords = item.title.toLowerCase().split(/\s+/);
      const contentWords = item.content.toLowerCase().split(/\s+/);
      const allWords = [...titleWords, ...contentWords];
      
      let score = 0;
      queryWords.forEach(qWord => {
        // 정확한 매칭
        if (allWords.some(word => word.includes(qWord) || qWord.includes(word))) {
          score += 2;
        }
        // 제목에서 매칭 (가중치 높음)
        if (item.title.toLowerCase().includes(qWord)) {
          score += 3;
        }
        // 내용에서 매칭
        if (item.content.toLowerCase().includes(qWord)) {
          score += 1;
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    });

    return highestScore > 0 ? bestMatch : null;
  };

  // 응답 생성
  const generateResponse = (query) => {
    if (knowledgeBase.length === 0) {
      return "해당 질문에 대해서는 보안 이슈가 있거나 배우고 있는중이라 답변 드리기 어렵습니다.";
    }

    const relevantKnowledge = searchKnowledge(query);

    if (relevantKnowledge) {
      return `Based on the knowledge base:\n\n**${relevantKnowledge.title}**\n\n${relevantKnowledge.content}`;
    } else {
      return "해당 질문에 대해서는 보안 이슈가 있거나 배우고 있는중이라 답변 드리기 어렵습니다.";
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // 타이핑 효과를 위한 지연
    setTimeout(() => {
      const response = generateResponse(inputText);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  // 엔터 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 지식 추가
  const addKnowledge = () => {
    if (!newKnowledge.title.trim() || !newKnowledge.content.trim()) return;

    setKnowledgeBase(prev => [...prev, {
      id: Date.now(),
      title: newKnowledge.title,
      content: newKnowledge.content
    }]);
    setNewKnowledge({ title: '', content: '' });
  };

  // 지식 삭제
  const deleteKnowledge = (id) => {
    setKnowledgeBase(prev => prev.filter(item => item.id !== id));
  };

  // 채팅 초기화
  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'bot',
      text: 'Chat cleared. How can I help you?',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // 배경 이미지 설정 (public 폴더에 bg-cheil.jpg 파일이 있으면 자동 적용)
  const bgStyle = {
    background: `
      linear-gradient(135deg, rgba(10, 10, 10, 0.85) 0%, rgba(26, 26, 46, 0.8) 50%, rgba(10, 10, 10, 0.85) 100%),
      url('${process.env.PUBLIC_URL}/bg-cheil.jpg')
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  return (
    <div className="app-container" style={bgStyle}>
      {/* 배경 효과 */}
      <div className="bg-effects">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="grid-pattern"></div>
      </div>

      <div className="main-content">
        {/* 헤더 */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo-icon cheil-logo">
              <img src="/cheil-logo.svg" alt="Cheil" />
            </div>
            <div className="header-title">
              <h1>Samsung.com AI Chatbot</h1>
              <span className="status-indicator">
                <span className="status-dot"></span>
                Online
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className={`header-btn ${showKnowledgePanel ? 'active' : ''}`}
              onClick={() => setShowKnowledgePanel(!showKnowledgePanel)}
            >
              <i className="bi bi-database"></i>
              Knowledge Base
              <span className="badge">{knowledgeBase.length}</span>
            </button>
            <button className="header-btn" onClick={clearChat}>
              <i className="bi bi-arrow-clockwise"></i>
              Clear
            </button>
          </div>
        </header>

        <div className="content-wrapper">
          {/* 지식 베이스 패널 */}
          <div className={`knowledge-panel ${showKnowledgePanel ? 'open' : ''}`}>
            <div className="panel-header">
              <h3><i className="bi bi-book me-2"></i>Knowledge Base</h3>
              <button className="close-btn" onClick={() => setShowKnowledgePanel(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="add-knowledge-form">
              <input
                type="text"
                placeholder="Title (e.g., Company Info)"
                value={newKnowledge.title}
                onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
              />
              <textarea
                placeholder="Content (Enter the information you want the AI to know...)"
                value={newKnowledge.content}
                onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
                rows={4}
              />
              <button className="add-btn" onClick={addKnowledge}>
                <i className="bi bi-plus-lg me-2"></i>
                Add Knowledge
              </button>
            </div>

            <div className="knowledge-list">
              {knowledgeBase.length === 0 ? (
                <div className="empty-knowledge">
                  <i className="bi bi-inbox"></i>
                  <p>No knowledge added yet</p>
                  <span>Add information above to train the AI</span>
                </div>
              ) : (
                knowledgeBase.map(item => (
                  <div key={item.id} className="knowledge-item">
                    <div className="knowledge-item-header">
                      <h4>{item.title}</h4>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteKnowledge(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    <p>{item.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  {msg.type === 'bot' && (
                    <div className="message-avatar bot-avatar">
                      <img src="/cheil-logo.svg" alt="Cheil" />
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      {msg.text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line.startsWith('**') && line.endsWith('**') ? (
                            <strong>{line.replace(/\*\*/g, '')}</strong>
                          ) : (
                            line
                          )}
                          {i < msg.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                    <span className="message-time">{msg.time}</span>
                  </div>
                  {msg.type === 'user' && (
                    <div className="message-avatar user">
                      <i className="bi bi-person"></i>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="message bot">
                  <div className="message-avatar bot-avatar">
                    <img src="/cheil-logo.svg" alt="Cheil" />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble typing">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  ref={inputRef}
                  placeholder="Ask me anything about your knowledge base..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                />
                <button 
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isTyping}
                >
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
              <p className="input-hint">
                <i className="bi bi-info-circle me-1"></i>
                Press Enter to send • Add knowledge to get relevant answers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
