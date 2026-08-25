-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 23/08/2026 às 04:42
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `sigeti`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `allocations`
--

CREATE TABLE `allocations` (
  `id` int(11) NOT NULL,
  `professional_id` int(11) NOT NULL,
  `client_company_id` int(11) NOT NULL,
  `allocated_by_user_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('ACTIVE','FINISHED') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `allocations`
--

INSERT INTO `allocations` (`id`, `professional_id`, `client_company_id`, `allocated_by_user_id`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(6, 3, 7, 3, '2026-08-20', NULL, 'ACTIVE', '2026-08-20 10:54:34');

-- --------------------------------------------------------

--
-- Estrutura para tabela `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(8, 'Armazenamento'),
(5, 'Cabo de Rede'),
(6, 'Cabo USB'),
(1, 'Computador'),
(10, 'Equipamento de Rede'),
(7, 'Fonte'),
(4, 'Impressora'),
(9, 'Memória'),
(3, 'Monitor'),
(2, 'Notebook'),
(11, 'Outros');

-- --------------------------------------------------------

--
-- Estrutura para tabela `companies`
--

CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `type` enum('PROVIDER','CLIENT') NOT NULL,
  `name` varchar(150) NOT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `companies`
--

INSERT INTO `companies` (`id`, `type`, `name`, `cnpj`, `status`, `created_at`) VALUES
(4, 'PROVIDER', 'Replait', '40.177.974/0001-60', 'ACTIVE', '2026-08-20 03:30:55'),
(7, 'CLIENT', 'Equipe AGO', '42.490.841/0001-73', 'ACTIVE', '2026-08-20 05:03:03');

-- --------------------------------------------------------

--
-- Estrutura para tabela `disposal_requests`
--

CREATE TABLE `disposal_requests` (
  `id` int(11) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `requested_by_user_id` int(11) NOT NULL,
  `request_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `reason` text NOT NULL,
  `status` enum('Pendente','Autorizado','Negado','Cancelado') DEFAULT 'Pendente',
  `decided_by_user_id` int(11) DEFAULT NULL,
  `decision_date` timestamp NULL DEFAULT NULL,
  `decision_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `disposal_requests`
--

INSERT INTO `disposal_requests` (`id`, `equipment_id`, `requested_by_user_id`, `request_date`, `reason`, `status`, `decided_by_user_id`, `decision_date`, `decision_notes`) VALUES
(2, 3, 3, '2026-08-20 05:21:48', 'Estragado', 'Negado', 3, '2026-08-20 10:14:35', 'Testou tudo?');

-- --------------------------------------------------------

--
-- Estrutura para tabela `equipment`
--

CREATE TABLE `equipment` (
  `id` int(11) NOT NULL,
  `patrimony_code` varchar(50) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `category_id` int(11) NOT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `status` enum('Funcionando','Funcionando parcialmente','Danificado','Sem teste','Em manutenção','Aguardando avaliação','Aguardando descarte','Descartado') NOT NULL,
  `is_working` tinyint(1) NOT NULL DEFAULT 1,
  `location` varchar(100) DEFAULT NULL,
  `client_company_id` int(11) DEFAULT NULL,
  `professional_in_charge_id` int(11) DEFAULT NULL,
  `specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specs`)),
  `observations` text DEFAULT NULL,
  `suggested_disposal_reason` text DEFAULT NULL,
  `created_by_user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `equipment`
--

INSERT INTO `equipment` (`id`, `patrimony_code`, `name`, `category_id`, `manufacturer`, `model`, `serial_number`, `status`, `is_working`, `location`, `client_company_id`, `professional_in_charge_id`, `specs`, `observations`, `suggested_disposal_reason`, `created_by_user_id`, `created_at`, `updated_at`) VALUES
(3, NULL, 'Monitor ', 1, 'Sansung', 'Preto', '43567829', 'Funcionando parcialmente', 1, NULL, 7, NULL, NULL, NULL, NULL, 3, '2026-08-20 05:04:59', '2026-08-20 10:14:35'),
(7, NULL, 'ergerg', 1, 'Sansung', 'Preto', '63645', 'Funcionando', 1, NULL, 7, NULL, NULL, NULL, NULL, 3, '2026-08-20 10:17:42', '2026-08-20 10:17:42');

-- --------------------------------------------------------

--
-- Estrutura para tabela `history`
--

CREATE TABLE `history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_affected` varchar(50) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `history`
--

INSERT INTO `history` (`id`, `user_id`, `action`, `entity_affected`, `entity_id`, `description`, `created_at`) VALUES
(15, 3, 'EXCLUSÃO DEFINITIVA', 'users', 2, 'Usuário ID 2 e todos os seus vínculos foram apagados permanentemente.', '2026-08-20 03:49:30'),
(16, 3, 'EXCLUSÃO DEFINITIVA', 'users', 1, 'Usuário ID 1 e todos os seus vínculos foram apagados permanentemente.', '2026-08-20 03:49:37'),
(17, 3, 'CADASTRO', 'companies', 6, 'Empresa Equipe AGO cadastrada', '2026-08-20 03:50:44'),
(18, 3, 'ALOCAÇÃO', 'allocations', 3, 'Profissional vinculado à empresa cliente ID 6', '2026-08-20 03:50:58'),
(19, 3, 'EXCLUSÃO DEFINITIVA', 'companies', 6, 'Empresa ID 6 excluída permanentemente.', '2026-08-20 04:19:01'),
(20, 3, 'LOGIN', 'users', 3, 'Usuário realizou login no sistema', '2026-08-20 05:01:12'),
(21, 3, 'ATUALIZAÇÃO', 'companies', 4, 'Empresa ID 4 atualizada.', '2026-08-20 05:01:28'),
(22, 3, 'ATUALIZAÇÃO', 'companies', 4, 'Empresa ID 4 atualizada.', '2026-08-20 05:02:26'),
(23, 3, 'CADASTRO', 'companies', 7, 'Empresa Equipe AGO cadastrada', '2026-08-20 05:03:03'),
(24, 3, 'CADASTRO', 'equipment', 3, 'Equipamento Monitor  cadastrado', '2026-08-20 05:04:59'),
(25, 3, 'ATUALIZAÇÃO', 'equipment', 3, 'Equipamento ID 3 realocado para empresa ID 7', '2026-08-20 05:05:31'),
(26, 3, 'ATUALIZAÇÃO', 'equipment', 3, 'Equipamento ID 3 realocado para empresa ID 7', '2026-08-20 05:12:51'),
(27, 3, 'ATUALIZAÇÃO', 'companies', 7, 'Empresa ID 7 atualizada.', '2026-08-20 05:13:00'),
(28, 3, 'SOLICITAÇÃO DE DESCARTE', 'equipment', 3, 'Solicitação registrada. Motivo: Estragado', '2026-08-20 05:21:48'),
(29, 3, 'LOGIN', 'users', 3, 'Usuário realizou login no sistema', '2026-08-20 10:05:26'),
(30, 3, 'DECISÃO DE DESCARTE', 'equipment', 3, 'Descarte Negado.', '2026-08-20 10:14:35'),
(31, 3, 'CADASTRO', 'equipment', 7, 'Equipamento ergerg cadastrado', '2026-08-20 10:17:42'),
(32, 3, 'ATUALIZAÇÃO', 'equipment', 7, 'Equipamento ID 7 realocado para empresa ID 7', '2026-08-20 10:17:52'),
(33, 3, 'ALOCAÇÃO', 'allocations', 6, 'Profissional vinculado à empresa cliente ID 7', '2026-08-20 10:54:34');

-- --------------------------------------------------------

--
-- Estrutura para tabela `professionals`
--

CREATE TABLE `professionals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `provider_company_id` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `professionals`
--

INSERT INTO `professionals` (`id`, `user_id`, `provider_company_id`, `phone`) VALUES
(3, 3, 4, '64992142391');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','USER') DEFAULT 'USER',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(3, 'Luiz Gustavo Valverde de Carvalho', 'lg1989451@gmail.com', '$2b$10$egWGk/k6TN1T3y33dpuBxeJ34fQkVaWheQ6C2QY1RgyxzTv3hIcLK', 'ADMIN', '2026-08-20 03:32:32');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `allocations`
--
ALTER TABLE `allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `professional_id` (`professional_id`),
  ADD KEY `client_company_id` (`client_company_id`),
  ADD KEY `allocated_by_user_id` (`allocated_by_user_id`);

--
-- Índices de tabela `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Índices de tabela `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`);

--
-- Índices de tabela `disposal_requests`
--
ALTER TABLE `disposal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipment_id` (`equipment_id`),
  ADD KEY `requested_by_user_id` (`requested_by_user_id`),
  ADD KEY `decided_by_user_id` (`decided_by_user_id`);

--
-- Índices de tabela `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patrimony_code` (`patrimony_code`),
  ADD UNIQUE KEY `serial_number` (`serial_number`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `professional_in_charge_id` (`professional_in_charge_id`),
  ADD KEY `created_by_user_id` (`created_by_user_id`),
  ADD KEY `idx_equipment_company` (`client_company_id`),
  ADD KEY `idx_equipment_status` (`status`);

--
-- Índices de tabela `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_history_entity` (`entity_affected`,`entity_id`);

--
-- Índices de tabela `professionals`
--
ALTER TABLE `professionals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `provider_company_id` (`provider_company_id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `allocations`
--
ALTER TABLE `allocations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `disposal_requests`
--
ALTER TABLE `disposal_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `equipment`
--
ALTER TABLE `equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `history`
--
ALTER TABLE `history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de tabela `professionals`
--
ALTER TABLE `professionals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `allocations`
--
ALTER TABLE `allocations`
  ADD CONSTRAINT `allocations_ibfk_1` FOREIGN KEY (`professional_id`) REFERENCES `professionals` (`id`),
  ADD CONSTRAINT `allocations_ibfk_2` FOREIGN KEY (`client_company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `allocations_ibfk_3` FOREIGN KEY (`allocated_by_user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `disposal_requests`
--
ALTER TABLE `disposal_requests`
  ADD CONSTRAINT `disposal_requests_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`),
  ADD CONSTRAINT `disposal_requests_ibfk_2` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `disposal_requests_ibfk_3` FOREIGN KEY (`decided_by_user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `equipment`
--
ALTER TABLE `equipment`
  ADD CONSTRAINT `equipment_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `equipment_ibfk_2` FOREIGN KEY (`client_company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `equipment_ibfk_3` FOREIGN KEY (`professional_in_charge_id`) REFERENCES `professionals` (`id`),
  ADD CONSTRAINT `equipment_ibfk_4` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `professionals`
--
ALTER TABLE `professionals`
  ADD CONSTRAINT `professionals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `professionals_ibfk_2` FOREIGN KEY (`provider_company_id`) REFERENCES `companies` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
