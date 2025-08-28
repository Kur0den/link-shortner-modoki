'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import bcrypt from 'bcryptjs';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        router.push('/auth/signin');
      } else {
        setError(data.error || '登録に失敗しました。');
      }
    } catch (error) {
      setError('エラーが発生しました。');
    }

    setLoading(false);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm bg-dark text-white">
            <Card.Body>
              <div className="mb-4">
                <h2 className="mb-0 text-center">短縮リンク管理システム</h2>
              </div>
              <h5 className="text-center mb-4">アカウント登録</h5>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>ユーザー名</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="ユーザー名を入力"
                    className="bg-dark text-white"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>パスワード</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="パスワードを入力"
                    className="bg-dark text-white"
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="success"
                    type="submit"
                    disabled={loading}
                    className="border-success"
                  >
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
