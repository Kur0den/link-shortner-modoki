'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import bcrypt from 'bcryptjs';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'danger' | ''>('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // ハッシュ化されたパスワードを生成
      const hashedPassword = await bcrypt.hash(password, 10);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password: hashedPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('登録が完了しました。');
        router.push('/auth/signin');
      } else {
        setMessageType('danger');
        setMessage(data.error || '登録に失敗しました。');
      }
    } catch (error) {
      setMessageType('danger');
      setMessage('エラーが発生しました。');
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">アカウント登録</h2>
          {message && (
            <Alert variant={messageType} className="mb-4">
              {message}
            </Alert>
          )}
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>ユーザー名</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>パスワード</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    登録中...
                  </>
                ) : (
                  '登録'
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
