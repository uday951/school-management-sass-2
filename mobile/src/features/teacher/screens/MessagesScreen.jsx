import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import { theme } from '../../../theme';

export default function MessagesScreen() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const res = await teacherApi.getMessages();
        setChats(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    try {
      const payload = {
        receiverId: selectedChat.partnerId,
        receiverModel: selectedChat.partnerModel || 'Parent',
        message: inputText.trim()
      };
      await teacherApi.sendChatMessage(payload);
      
      // Update local state mock for immediate feedback
      const updatedMessages = [
        {
          ...payload,
          senderId: '6a6237bed724b22b37b5255a', // Sarah mock ID
          senderModel: 'Teacher',
          createdAt: new Date().toISOString()
        },
        ...(selectedChat.messages || [])
      ];
      setSelectedChat((prev) => ({ ...prev, messages: updatedMessages }));
      setInputText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScreenContainer title="Teacher Chat Desk" loading={loading}>
      {selectedChat ? (
        <View style={styles.chatContainer}>
          <TouchableOpacity style={styles.backHeader} onPress={() => setSelectedChat(null)}>
            <Text style={styles.backBtn}>← Chat with {selectedChat.partnerName || 'User'}</Text>
          </TouchableOpacity>

          <FlatList
            inverted
            data={selectedChat.messages}
            keyExtractor={(item, index) => item._id || item.id || index.toString()}
            ListEmptyComponent={<EmptyState title="No Messages" message="Send a message to open conversation." />}
            renderItem={({ item }) => {
              const isMe = item.senderModel === 'Teacher' || item.senderId === '6a6237bed724b22b37b5255a';
              return (
                <View style={[styles.msgWrapper, isMe ? styles.msgMe : styles.msgOther]}>
                  <View style={[styles.msgBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                    <Text style={[styles.msgText, isMe ? styles.textMe : styles.textOther]}>{item.message}</Text>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.chatList}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type message here..."
              placeholderTextColor={theme.colors.light.textMuted}
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.partnerId}
          ListEmptyComponent={<EmptyState title="No Conversations" message="No messages exchanged in your chat desk recently." />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatRow} onPress={() => setSelectedChat(item)}>
              <Text style={styles.chatName}>{item.partnerName || 'Parent / Staff'}</Text>
              <Text style={styles.lastMsg}>{item.lastMessage || 'Open direct messaging channel'}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md
  },
  chatRow: {
    backgroundColor: theme.colors.light.card,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  chatName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  lastMsg: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.light.textMuted,
    marginTop: 4
  },
  chatContainer: {
    flex: 1
  },
  backHeader: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border
  },
  backBtn: {
    color: theme.colors.light.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold
  },
  chatList: {
    padding: theme.spacing.md
  },
  msgWrapper: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm
  },
  msgMe: {
    justifyContent: 'flex-end'
  },
  msgOther: {
    justifyContent: 'flex-start'
  },
  msgBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: 16
  },
  bubbleMe: {
    backgroundColor: theme.colors.light.primary,
    borderBottomRightRadius: 2
  },
  bubbleOther: {
    backgroundColor: theme.colors.light.border,
    borderBottomLeftRadius: 2
  },
  msgText: {
    fontSize: theme.typography.sizes.md
  },
  textMe: {
    color: theme.colors.light.primaryForeground
  },
  textOther: {
    color: theme.colors.light.text
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.light.text,
    backgroundColor: theme.colors.light.background,
    marginRight: theme.spacing.sm
  },
  sendBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 20
  },
  sendBtnText: {
    color: theme.colors.light.primaryForeground,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold
  }
});
