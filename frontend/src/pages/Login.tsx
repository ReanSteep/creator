import { useState } from 'react';
import { TextInput, Button, Paper, Title, Text, Container } from '@mantine/core';
import { useAuth } from '../providers/AuthProvider';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await signIn(email);
      setMessage('Check your email for the magic link!');
    } catch (error) {
      setMessage('Error sending magic link. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-steam-dark to-steam-light flex items-center justify-center p-4">
      <Container size="xs">
        <Paper
          className="backdrop-blur-glass bg-opacity-30 bg-steam-light p-8"
          radius="md"
          withBorder
        >
          <Title order={2} className="text-center mb-6 text-steam-blue">
            Secure Collaboration
          </Title>
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="bg-steam-blue hover:bg-opacity-90"
            >
              Send Magic Link
            </Button>
          </form>
          {message && (
            <Text className="mt-4 text-center text-sm" color={message.includes('Error') ? 'red' : 'green'}>
              {message}
            </Text>
          )}
          <Text className="mt-6 text-center text-sm text-gray-400">
            Private, encrypted collaboration. No passwords.
          </Text>
        </Paper>
      </Container>
    </div>
  );
} 