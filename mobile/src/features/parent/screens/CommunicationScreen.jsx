import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../../components/layout/ScreenContainer';
import EmptyState from '../../../components/feedback/EmptyState';
import parentApi from '../../../services/api/parent.api';
import { theme } from '../../../theme';

export default function CommunicationScreen() {
  const [teachers, setTeachers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const res = await parentApi.getChatTeachers();
        setTeachers(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedTeacher?._id && !selectedTeacher?.id) return;
      const partnerId = selectedTeacher._id || selectedTeacher.id;
      try {
        const res = await parentApi.getChatMessages(partnerId);
        setMessages(res.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [selectedTeacher]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedTeacher) return;
    const partnerId = selectedTeacher._id || selectedTeacher.id;
    try {
      const payload = {
        receiverId: partnerId,
        receiverModel: 'Teacher',
        message: inputText.trim()
      };
      const res = await parentApi.sendChatMessage(payload);
      setMessages((prev) => [res.data?.data || payload, ...prev]);
      setInputText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScreenContainer title="Messages & Chat" loading={loading}>
      {selectedTeacher ? (
        <View style={styles.chatContainer}>
          <TouchableOpacity style={styles.backHeader} onPress={() => setSelectedTeacher(null)}>
            <Text style={styles.backBtn}>← Chat with {selectedTeacher.name || 'Teacher'}</Text>
          </TouchableOpacity>
          
          <FlatList
            inverted
            data={messages}
            keyExtractor={(item, index) => item._id || item.id || index.toString()}
            ListEmptyComponent={<EmptyState title="No Conversations" message="Start conversation by sending a new text message." />}
            renderItem={({ item }) => {
              const isMe = item.senderModel === 'Parent' || item.senderId === '6a63785e11b63a63ef656825'; // Robert ID matching mock
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
              placeholder="Type your message here..."
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
          data={teachers}
          keyExtractor={(item) => item._id || item.id}
          ListEmptyComponent={<EmptyState title="No Instructors Found" message="Your children's classes have no teachers assigned." />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.teacherRow} onPress={() => setSelectedTeacher(item)}>
              <Text style={styles.teacherName}>{item.partnerName || item.name || 'Unknown Teacher'}</Text>
              <Text style={styles.lastMsg}>{item.lastMessage || 'Tap to start direct messaging'}</Text>
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
  teacherRow: {
    backgroundColor: theme.colors.light.card,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    ...theme.shadows.sm
  },
  teacherName: {
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
