-- Demo seed for LinkedIn recording (current month: September 2026)
-- Run: npm run seed:demo

BEGIN;

TRUNCATE TABLE transactions, budgets, financial_accounts, financial_investments, connections RESTART IDENTITY CASCADE;

-- Connections
INSERT INTO connections (id, pluggy_item_id, status, connector_name, created_at, updated_at) VALUES
  ('c1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'UPDATED', 'Nubank', NOW(), NOW()),
  ('c2222222-2222-4222-8222-222222222222', 'a2222222-2222-4222-8222-222222222222', 'UPDATED', 'Itaú', NOW(), NOW());

-- Bank accounts & credit card
INSERT INTO financial_accounts (id, pluggy_account_id, pluggy_item_id, name, type, subtype, balance, credit_limit, available_credit_limit, balance_due_date, brand, created_at, updated_at) VALUES
  ('f1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'Nubank Conta', 'BANK', 'CHECKING_ACCOUNT', 12450.00, NULL, NULL, NULL, NULL, NOW(), NOW()),
  ('f2222222-2222-4222-8222-222222222222', 'b2222222-2222-4222-8222-222222222222', 'a2222222-2222-4222-8222-222222222222', 'Itaú Conta Corrente', 'BANK', 'CHECKING_ACCOUNT', 3200.00, NULL, NULL, NULL, NULL, NOW(), NOW()),
  ('f3333333-3333-4333-8333-333333333333', 'b3333333-3333-4333-8333-333333333333', 'a1111111-1111-4111-8111-111111111111', 'Nubank Ultravioleta', 'CREDIT', 'CREDIT_CARD', 1850.00, 15000.00, 13150.00, '2026-10-05', 'MASTERCARD', NOW(), NOW());

-- Investments
INSERT INTO financial_investments (id, pluggy_investment_id, pluggy_item_id, name, balance, type, subtype, status, created_at, updated_at) VALUES
  ('e1111111-1111-4111-8111-111111111111', 'd1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'CDB Nubank 110% CDI', 15200.00, 'FIXED_INCOME', 'CDB', 'ACTIVE', NOW(), NOW()),
  ('e2222222-2222-4222-8222-222222222222', 'd2222222-2222-4222-8222-222222222222', 'a1111111-1111-4111-8111-111111111111', 'Tesouro Selic 2029', 13300.00, 'FIXED_INCOME', 'TREASURY', 'ACTIVE', NOW(), NOW());

-- Transactions (September 2026)
INSERT INTO transactions (id, description, category, account, date, amount, pluggy_transaction_id, created_at, updated_at) VALUES
  ('a0100001-0000-4000-8000-000000000001', 'SALARIO EMPRESA XYZ LTDA', 'Renda', 'Nubank Conta', '2026-09-05', 8500.00, NULL, NOW(), NOW()),
  ('a0100002-0000-4000-8000-000000000002', 'ALUGUEL APTO 402', 'Despesas Fixas', 'Nubank Conta', '2026-09-03', -2200.00, NULL, NOW(), NOW()),
  ('a0100003-0000-4000-8000-000000000003', 'CONTA LUZ CPFL', 'Despesas Fixas', 'Nubank Conta', '2026-09-06', -189.00, NULL, NOW(), NOW()),
  ('a0100004-0000-4000-8000-000000000004', 'CONTA AGUA SABESP', 'Despesas Fixas', 'Nubank Conta', '2026-09-06', -98.40, NULL, NOW(), NOW()),
  ('a0100005-0000-4000-8000-000000000005', 'INTERNET VIVO FIBRA', 'Despesas Fixas', 'Nubank Conta', '2026-09-02', -129.90, NULL, NOW(), NOW()),
  ('a0100006-0000-4000-8000-000000000006', 'PAO DE ACUCAR', 'Alimentação', 'Nubank Conta', '2026-09-07', -234.80, NULL, NOW(), NOW()),
  ('a0100007-0000-4000-8000-000000000007', 'CARREFOUR MARKET', 'Alimentação', 'Nubank Conta', '2026-09-13', -187.35, NULL, NOW(), NOW()),
  ('a0100008-0000-4000-8000-000000000008', 'NETFLIX.COM', 'Assinaturas', 'Nubank Ultravioleta', '2026-09-01', -55.90, NULL, NOW(), NOW()),
  ('a0100009-0000-4000-8000-000000000009', 'SPOTIFY', 'Assinaturas', 'Nubank Ultravioleta', '2026-09-10', -21.90, NULL, NOW(), NOW()),
  ('a0100010-0000-4000-8000-000000000010', 'DISNEY PLUS', 'Assinaturas', 'Nubank Ultravioleta', '2026-09-10', -27.90, NULL, NOW(), NOW()),
  ('a0100011-0000-4000-8000-000000000011', 'IFOOD *RESTAURANTE', 'Alimentação', 'Nubank Ultravioleta', '2026-09-08', -89.90, NULL, NOW(), NOW()),
  ('a0100012-0000-4000-8000-000000000012', 'RAPPI *BURGER KING', 'Alimentação', 'Nubank Ultravioleta', '2026-09-16', -42.50, NULL, NOW(), NOW()),
  ('a0100013-0000-4000-8000-000000000013', 'UBER TRIP', 'Transporte', 'Nubank Ultravioleta', '2026-09-09', -32.50, NULL, NOW(), NOW()),
  ('a0100014-0000-4000-8000-000000000014', '99 TAXI', 'Transporte', 'Nubank Ultravioleta', '2026-09-17', -18.70, NULL, NOW(), NOW()),
  ('a0100015-0000-4000-8000-000000000015', 'POSTO SHELL', 'Transporte', 'Nubank Conta', '2026-09-21', -150.00, NULL, NOW(), NOW()),
  ('a0100016-0000-4000-8000-000000000016', 'ESTACIONAMENTO SHOPPING', 'Transporte', 'Nubank Conta', '2026-09-20', -22.00, NULL, NOW(), NOW()),
  ('a0100017-0000-4000-8000-000000000017', 'PIX ENVIADO - Joao Silva', 'Transferências', 'Nubank Conta', '2026-09-11', -500.00, NULL, NOW(), NOW()),
  ('a0100018-0000-4000-8000-000000000018', 'PIX ENVIADO - Maria Santos', 'Transferências', 'Nubank Conta', '2026-09-18', -200.00, NULL, NOW(), NOW()),
  ('a0100019-0000-4000-8000-000000000019', 'PIX ENVIADO - Ana Costa', 'Transferências', 'Itaú Conta Corrente', '2026-09-04', -350.00, NULL, NOW(), NOW()),
  ('a0100020-0000-4000-8000-000000000020', 'DROGA RAIA', 'Saúde', 'Nubank Ultravioleta', '2026-09-12', -67.40, NULL, NOW(), NOW()),
  ('a0100021-0000-4000-8000-000000000021', 'ACADEMIA SMART FIT', 'Saúde', 'Nubank Conta', '2026-09-14', -119.90, NULL, NOW(), NOW()),
  ('a0100022-0000-4000-8000-000000000022', 'FARMACIA PACHECO', 'Saúde', 'Nubank Ultravioleta', '2026-09-08', -45.60, NULL, NOW(), NOW()),
  ('a0100023-0000-4000-8000-000000000023', 'MERCADO LIVRE', 'Lazer', 'Nubank Ultravioleta', '2026-09-15', -156.00, NULL, NOW(), NOW()),
  ('a0100024-0000-4000-8000-000000000024', 'CINEMA CINEMARK', 'Lazer', 'Nubank Ultravioleta', '2026-09-19', -64.00, NULL, NOW(), NOW()),
  ('a0100025-0000-4000-8000-000000000025', 'AMAZON BR', 'Lazer', 'Nubank Ultravioleta', '2026-09-22', -89.00, NULL, NOW(), NOW()),
  ('a0100026-0000-4000-8000-000000000026', 'STEAM GAMES', 'Lazer', 'Nubank Ultravioleta', '2026-09-07', -49.99, NULL, NOW(), NOW()),
  ('a0100027-0000-4000-8000-000000000027', 'STARBUCKS COFFEE', 'Alimentação', 'Nubank Ultravioleta', '2026-09-23', -28.50, NULL, NOW(), NOW()),
  ('a0100028-0000-4000-8000-000000000028', 'PADARIA DO BAIRRO', 'Alimentação', 'Nubank Conta', '2026-09-23', -16.80, NULL, NOW(), NOW()),
  ('a0100029-0000-4000-8000-000000000029', 'PAGAMENTO DE FATURA', 'Transferências', 'Nubank Conta', '2026-09-20', -1850.00, NULL, NOW(), NOW()),
  ('a0100030-0000-4000-8000-000000000030', 'TED RECEBIDO - FREELANCE', 'Renda', 'Itaú Conta Corrente', '2026-09-12', 1200.00, NULL, NOW(), NOW()),
  ('a0100031-0000-4000-8000-000000000031', 'SHOPEE BR', 'Outros', 'Nubank Ultravioleta', '2026-09-05', -78.90, NULL, NOW(), NOW()),
  ('a0100032-0000-4000-8000-000000000032', 'ZARA BRASIL', 'Outros', 'Nubank Ultravioleta', '2026-09-11', -219.00, NULL, NOW(), NOW());

-- Budgets
INSERT INTO budgets (id, category, "limit", period, alert_threshold, created_at, updated_at) VALUES
  ('b1111111-1111-4111-8111-111111111111', 'Alimentação', 800.00, 'monthly', 80, NOW(), NOW()),
  ('b2222222-2222-4222-8222-222222222222', 'Transporte', 400.00, 'monthly', 80, NOW(), NOW()),
  ('b3333333-3333-4333-8333-333333333333', 'Assinaturas', 150.00, 'monthly', 100, NOW(), NOW()),
  ('b4444444-4444-4444-8444-444444444444', 'Lazer', 300.00, 'monthly', 80, NOW(), NOW()),
  ('b5555555-5555-4555-8555-555555555555', 'Despesas Fixas', 2500.00, 'monthly', 80, NOW(), NOW());

COMMIT;
