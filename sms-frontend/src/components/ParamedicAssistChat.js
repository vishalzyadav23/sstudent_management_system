import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';

function ParamedicAssistChat({ student, healthData, latestReading }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [serviceError, setServiceError] = useState(null);

  const symptomQuestions = [
    'I am feeling dizzy and weak. What should I do?',
    'My heart rate feels too fast. Is this serious?',
    'I have a headache and slightly elevated temperature.',
    'I am short of breath and feel tired.'
  ];

  const emergencyNumber = student?.phoneNumber || '112';
  const emergencyLabel = student?.phoneNumber ? `Call ${student.name || 'Student'}` : 'Campus Emergency';

  const healthAlert = useMemo(() => {
    if (!latestReading) return null;
    const issues = [];
    if (latestReading.bpm > 100) issues.push('high heart rate');
    if (latestReading.bpm < 55) issues.push('low heart rate');
    if (latestReading.spo2 < 94) issues.push('low blood oxygen');
    if (latestReading.bodyTemp > 37.5) issues.push('elevated temperature');
    if (latestReading.bodyTemp < 35.5) issues.push('low body temperature');
    if (issues.length === 0) return null;
    return {
      title: 'Health Alert',
      message: `Potential issue detected: ${issues.join(', ')}. Please review or contact medical support immediately.`
    };
  }, [latestReading]);

  const historyRecords = useMemo(() => {
    return (healthData || []).slice(-5).reverse().map(record => ({
      ...record,
      timeLabel: record.timeLabel || (record.recordedAt ? new Date(record.recordedAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Unknown'),
      note: record.note || 'Vitals captured from IoT device.'
    }));
  }, [healthData]);

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('jwtToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const analyzeCurrentHealth = useCallback(async () => {
    if (!latestReading) {
      setServiceError('Live vitals are not available yet. Please wait for the next update.');
      return;
    }

    setLoading(true);
    setServiceError(null);
    setShowChat(true);

    const payload = {
      bpm: latestReading.bpm,
      spo2: latestReading.spo2,
      bodyTemp: latestReading.bodyTemp,
      roomTemp: latestReading.roomTemp,
      roomHumidity: latestReading.roomHumidity
    };

    try {
      const response = await api.post('/ai/analyze-health', payload);
      const text = response.data?.analysis || response.data?.error || 'AI assistant did not return a response.';
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          text,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error analyzing health data:', error.response ? error.response.data : error.message, error);
      const message = error.response?.data?.error || 'Unable to connect to AI service. Please check your connection.';
      setServiceError(message);
      setChatMessages(prev => [
        ...prev,
        {
          type: 'ai',
          text: message,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [latestReading]);

  useEffect(() => {
    if (latestReading) {
      analyzeCurrentHealth();
    }
  }, [analyzeCurrentHealth]);

  const sendChatQuestion = async (question) => {
    const trimmed = question?.trim();
    if (!trimmed) return;

    const userMessage = {
      type: 'user',
      text: trimmed,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);
    setShowChat(true);

    if (!latestReading) {
      setChatMessages(prev => [...prev, {
        type: 'ai',
        text: 'Live health data is not available yet. Please wait for the next update.',
        timestamp: new Date()
      }]);
      setLoading(false);
      return;
    }

    const healthContext = {
      bpm: latestReading.bpm || 'N/A',
      spo2: latestReading.spo2 || 'N/A',
      bodyTemp: latestReading.bodyTemp || 'N/A',
      roomTemp: latestReading.roomTemp || 'N/A',
      roomHumidity: latestReading.roomHumidity || 'N/A'
    };

    try {
      const response = await api.post('/ai/medical-question', {
        question: trimmed,
        healthContext
      }, { headers: getAuthHeader() });

      if (response.data.success) {
        const aiResponse = {
          type: 'ai',
          text: response.data.answer || 'AI assistant did not return a response.',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error(response.data.error || 'AI assistant returned an error.');
      }
    } catch (error) {
      console.error('Error sending question:', error.response ? error.response.data : error.message, error);
      const message = error.response?.data?.error || 'Error: Unable to process your question. Please try again.';
      setServiceError(message);
      setChatMessages(prev => [...prev, {
        type: 'ai',
        text: message,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = (e) => {
    e.preventDefault();
    sendChatQuestion(userInput);
  };

  const handleQuickQuestion = (question) => {
    sendChatQuestion(question);
  };

  return (
    <div style={{ marginTop: '30px' }}>
      {/* AI TRIAGE MODE HEADER */}
      <div style={{
        background: '#1a3a3a',
        border: '2px solid #00ff88',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ color: '#00ff88', fontSize: '20px' }}>⚠️</span>
          <h3 style={{ margin: 0, color: '#00ff88', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            AI FIELD TRIAGE MODE - LIVE ANALYSIS
          </h3>
        </div>
        <p style={{ margin: '0', color: '#aaa', fontSize: '13px' }}>
          🚑 System ready. Real-time health monitoring and paramedic decision support enabled.
        </p>
      </div>

      {serviceError && (
        <div style={{
          marginBottom: '20px',
          padding: '15px 18px',
          borderRadius: '14px',
          background: 'rgba(248, 113, 113, 0.15)',
          border: '1px solid rgba(248, 113, 113, 0.4)',
          color: '#b91c1c'
        }}>
          <strong>AI Service Issue:</strong> {serviceError}
        </div>
      )}

      {/* QUICK STATS */}
      {healthData && healthData.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 100, 100, 0.1)',
            border: '1px solid rgba(255, 100, 100, 0.5)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#ff6464', textTransform: 'uppercase', marginBottom: '5px' }}>Heart Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6464' }}>{healthData[healthData.length - 1].bpm}</div>
            <div style={{ fontSize: '11px', color: '#999' }}>BPM</div>
          </div>

          <div style={{
            background: 'rgba(100, 150, 255, 0.1)',
            border: '1px solid rgba(100, 150, 255, 0.5)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6496ff', textTransform: 'uppercase', marginBottom: '5px' }}>Blood O2</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6496ff' }}>{healthData[healthData.length - 1].spo2}</div>
            <div style={{ fontSize: '11px', color: '#999' }}>%</div>
          </div>

          <div style={{
            background: 'rgba(255, 180, 100, 0.1)',
            border: '1px solid rgba(255, 180, 100, 0.5)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#ffb464', textTransform: 'uppercase', marginBottom: '5px' }}>Body Temp</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffb464' }}>{healthData[healthData.length - 1].bodyTemp?.toFixed(1) || 'N/A'}</div>
            <div style={{ fontSize: '11px', color: '#999' }}>°C</div>
          </div>
        </div>
      )}

      {healthAlert && (
        <div style={{
          marginBottom: '20px',
          padding: '18px',
          borderRadius: '16px',
          background: 'rgba(255, 214, 214, 0.3)',
          border: '1px solid #ff6b6b',
          color: '#7f1d1d'
        }}>
          <strong>{healthAlert.title}:</strong> {healthAlert.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#111827', padding: '18px', borderRadius: '18px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Symptom Checker</div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '8px' }}>Guided questions</div>
            </div>
            <span style={{ fontSize: '20px' }}>🩺</span>
          </div>
          <p style={{ margin: '0 0 14px', color: '#d1d5db', fontSize: '13px' }}>Tap one of these to ask the AI assistant about your most common concerns.</p>
          <div style={{ display: 'grid', gap: '10px' }}>
            {symptomQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#1f2937',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#e5e7eb',
                  textAlign: 'left',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '18px', borderRadius: '18px', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Emergency Contact</div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '8px' }}>Quick response</div>
            </div>
            <span style={{ fontSize: '20px' }}>📞</span>
          </div>
          <p style={{ margin: '0 0 16px', color: '#d1d5db', fontSize: '13px' }}>Call the student or campus emergency line immediately if the alert status indicates a risk.</p>
          <a
            href={`tel:${emergencyNumber}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '12px',
              background: '#10b981',
              color: '#000',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '700',
              marginBottom: '12px'
            }}
          >
            {emergencyLabel}
          </a>
          <div style={{ color: '#d1d5db', fontSize: '13px' }}>
            Campus emergency: <strong>112</strong>
          </div>
        </div>
      </div>

      <div style={{
        marginBottom: '20px',
        padding: '18px',
        borderRadius: '18px',
        background: '#0f172a',
        color: '#cbd5e1'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Health History</div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '6px' }}>Recent readings timeline</div>
          </div>
          <span style={{ fontSize: '20px' }}>🕒</span>
        </div>
        {historyRecords.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>No health history is available yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {historyRecords.map((record, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', padding: '14px', background: '#111827', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>{record.timeLabel}</div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>{record.note || 'Vitals captured from IoT device.'}</div>
                </div>
                <div style={{ display: 'grid', gap: '6px', textAlign: 'right' }}>
                  <span style={{ color: '#f97316', fontSize: '13px' }}>HR {record.bpm} bpm</span>
                  <span style={{ color: '#38bdf8', fontSize: '13px' }}>SpO₂ {record.spo2}%</span>
                  <span style={{ color: '#fbbf24', fontSize: '13px' }}>{record.bodyTemp?.toFixed(1)}°C</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHAT INTERFACE */}
      <div style={{
        background: '#0f1419',
        border: '1px solid #333',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '450px'
      }}>
        {/* CHAT HEADER */}
        <div style={{
          background: '#1a1f26',
          padding: '15px 20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h4 style={{ margin: 0, color: '#00d9ff', fontSize: '14px', fontWeight: 'bold' }}>
            🤖 PARAMEDIC ASSIST CHAT
          </h4>
          <button
            onClick={() => setShowChat(!showChat)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00d9ff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showChat ? '▼' : '▶'}
          </button>
        </div>

        {/* CHAT MESSAGES */}
        {showChat && (
          <>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                  <p>👋 Ask medical questions or click "Analyze Health" to get started</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: '10px'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '12px 15px',
                        borderRadius: '8px',
                        background: msg.type === 'user' ? '#00d9ff' : '#1a3a3a',
                        color: msg.type === 'user' ? '#000' : '#00ff88',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        border: msg.type === 'user' ? 'none' : '1px solid #00ff88'
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <span>⏳ Analyzing...</span>
                </div>
              )}
            </div>

            {/* CHAT INPUT */}
            <form
              onSubmit={handleSendQuestion}
              style={{
                borderTop: '1px solid #333',
                padding: '15px',
                background: '#1a1f26',
                display: 'flex',
                gap: '10px'
              }}
            >
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={latestReading ? "Ask about medication, symptoms, or vital signs..." : "Waiting for live vitals data..."}
                disabled={loading || !latestReading}
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#0f1419',
                  color: '#00ff88',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading || !latestReading || !userInput.trim()}
                style={{
                  padding: '10px 20px',
                  background: '#00d9ff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  opacity: loading ? 0.5 : 1
                }}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button
          onClick={analyzeCurrentHealth}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            background: '#00ff88',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          🏥 Analyze Current Health
        </button>
        <button
          onClick={() => setChatMessages([])}
          style={{
            flex: 1,
            padding: '12px',
            background: 'rgba(255, 100, 100, 0.2)',
            color: '#ff6464',
            border: '1px solid rgba(255, 100, 100, 0.5)',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Chat
        </button>
      </div>
    </div>
  );
}

export default ParamedicAssistChat;
