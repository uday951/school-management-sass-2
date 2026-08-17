import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import teacherApi from '../../../services/api/teacher.api';
import useAuthStore from '../../../store/authStore';
import { theme } from '../../../theme';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id || '';

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = async () => {
    try {
      const res = await teacherApi.getMessages();
      setChats(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching teacher chats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    const messageText = inputText.trim();
    setInputText('');

    try {
      const payload = {
        receiverId: selectedChat.partnerId,
        receiverModel: selectedChat.partnerModel || 'Parent',
        message: messageText
      };
      const res = await teacherApi.sendChatMessage(payload);
      const newMsg = res.data?.data || {
        _id: Date.now().toString(),
        senderId: currentUserId,
        senderModel: 'Teacher',
        message: messageText,
        createdAt: new Date().toISOString()
      };

      setSelectedChat((prev) => ({
        ...prev,
        messages: [newMsg, ...(prev?.messages || [])]
      }));
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  return (
    <ScreenContainer title="Teacher Communication Portal" loading={loading}>
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
              const isMe = item.senderModel === 'Teacher' || (currentUserId && item.senderId?.toString() === currentUserId.toString());
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.light.primary]} />}
          ListEmptyComponent={<EmptyState title="No Conversations" message="No messages exchanged in your chat desk recently." />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatRow} onPress={() => setSelectedChat(item)}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{item.partnerName || 'Parent / Staff'}</Text>
                {item.unreadCount > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage || 'Open direct messaging channel'}</Text>
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
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chatName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text
  },
  unreadBadge: {
    backgroundColor: theme.colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: theme.typography.weights.bold
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
