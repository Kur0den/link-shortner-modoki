'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  ListGroup,
  Spinner,
  Navbar,
  Nav,
  Form
} from 'react-bootstrap';
import type { ShortLink } from '../../types/link';
import ThemeToggle from '../../components/ThemeToggle';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'danger'>('success');

  // フォーム状態
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (status === 'loading') {
      return; // セッションの読み込み中
    }

    if (!session) {
      router.push('/auth/signin'); // 未認証ユーザーはログインページへ
    } else if (!session.user?.name) {
      router.push('/auth/register'); // ユーザー登録されていない場合は登録ページへ
    }
  }, [session, status, router]);

  // リンクデータの取得
  useEffect(() => {
    if (session) {
      fetchLinks();
    }
  }, [session]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/links');
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
      setMessage('リンクの取得に失敗しました');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  // 短縮リンクを作成
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!originalUrl.trim()) {
      setMessage('URLを入力してください');
      setMessageType('danger');
      return;
    }

    setCreateLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: originalUrl.trim(),
          title: title.trim() || undefined,
        }),
      });

      if (response.ok) {
        const newLink = await response.json();
        setLinks([newLink, ...links]);
        setOriginalUrl('');
        setTitle('');
        setMessage('短縮リンクを作成しました！');
        setMessageType('success');
      } else {
        const error = await response.json();
        setMessage(error.error || '作成に失敗しました');
        setMessageType('danger');
      }
    } catch (error) {
      setMessage('ネットワークエラーが発生しました');
      setMessageType('danger');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('このリンクを削除しますか？')) return;

    try {
      const response = await fetch(`/api/links?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLinks(links.filter(link => link.id !== id));
        setMessage('リンクを削除しました');
        setMessageType('success');
      } else {
        setMessage('削除に失敗しました');
        setMessageType('danger');
      }
    } catch (error) {
      setMessage('ネットワークエラーが発生しました');
      setMessageType('danger');
    }
  };

  // 短縮リンクをコピー
  const handleCopyLink = async (shortCode: string) => {
    const shortUrl = `${window.location.origin}/api/${shortCode}`;

    try {
      await navigator.clipboard.writeText(shortUrl);
      setMessage('リンクをコピーしました！');
      setMessageType('success');
    } catch (error) {
      setMessage('コピーに失敗しました');
      setMessageType('danger');
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  // 認証中の表示
  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </Spinner>
      </div>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト処理中）
  if (!session) {
    return null;
  }

  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);

  return (
    <div className={`min-vh-100 ${theme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
      {/* ナビゲーションバー */}
      <Navbar bg="primary" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>管理ダッシュボード</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Item className="me-3">
              <span className="navbar-text">
                こんにちは、{session.user?.name}さん
              </span>
            </Nav.Item>
            <Nav.Item className="me-3">
              <ThemeToggle />
            </Nav.Item>
            <Nav.Item>
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleLogout}
              >
                ログアウト
              </Button>
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        <Row>
          {/* 統計情報 */}
          <Col lg={12} className="mb-4">
            <Row>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="text-center">
                    <h2 className="text-primary">{links.length}</h2>
                    <p className="mb-0">作成されたリンク数</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-3">
                <Card className="h-100">
                  <Card.Body className="text-center">
                    <h2 className="text-success">{totalClicks}</h2>
                    <p className="mb-0">総クリック数</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* メッセージ */}
          {message && (
            <Col lg={12} className="mb-4">
              <Alert
                variant={messageType}
                dismissible
                onClose={() => setMessage('')}
              >
                {message}
              </Alert>
            </Col>
          )}

          {/* リンク作成フォーム */}
          <Col lg={12} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                <h4 className="mb-0">新しいリンクを作成</h4>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleCreateLink}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>短縮したいURL *</Form.Label>
                        <Form.Control
                          type="url"
                          value={originalUrl}
                          onChange={(e) => setOriginalUrl(e.target.value)}
                          placeholder="https://example.com/very-long-url"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>タイトル（任意）</Form.Label>
                        <Form.Control
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="わかりやすい名前を付けてください"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid d-md-block">
                    <Button
                      type="submit"
                      variant="success"
                      disabled={createLoading}
                    >
                      {createLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          作成中...
                        </>
                      ) : (
                        '短縮リンクを作成'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* リンク管理 */}
          <Col lg={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-secondary text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">リンク管理</h4>
                <Badge bg="light" text="dark" className="fs-6">
                  {links.length}件
                </Badge>
              </Card.Header>

              {loading ? (
                <Card.Body className="text-center py-5">
                  <Spinner animation="border" className="me-2" />
                  読み込み中...
                </Card.Body>
              ) : links.length === 0 ? (
                <Card.Body className="text-center py-5">
                  <div className="text-muted">
                    <div className="display-1 mb-3">📋</div>
                    <h5>リンクがありません</h5>
                    <p>上のフォームから最初のリンクを作成してみましょう</p>
                  </div>
                </Card.Body>
              ) : (
                <ListGroup variant="flush">
                  {links.map((link) => (
                    <ListGroup.Item key={link.id} className="py-3">
                      <Row className="align-items-center">
                        <Col>
                          {link.title && (
                            <h6 className="mb-2 text-primary">
                              {link.title}
                            </h6>
                          )}

                          <div className="mb-2">
                            <small className="text-muted me-2">短縮URL:</small>
                            <code className="bg-light px-2 py-1 rounded">
                              {typeof window !== 'undefined' ? window.location.origin : ''}/api/{link.shortCode}
                            </code>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="ms-2"
                              onClick={() => handleCopyLink(link.shortCode)}
                            >
                              コピー
                            </Button>
                          </div>

                          <div className="mb-2">
                            <small className="text-muted me-2">元URL:</small>
                            <a
                              href={link.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              {link.originalUrl.length > 80
                                ? link.originalUrl.substring(0, 80) + '...'
                                : link.originalUrl
                              }
                              ↗
                            </a>
                          </div>

                          <div className="d-flex gap-3 text-muted small">
                            <span>
                              <Badge bg="success">
                                {link.clickCount} クリック
                              </Badge>
                            </span>
                            <span>
                              作成: {new Date(link.createdAt).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                        </Col>

                        <Col xs="auto">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            削除
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
