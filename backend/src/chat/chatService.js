const { pool } = require('../database');

const criarConversaDireta = async (userId1, userId2) => {
  const existing = await pool.query(`
    SELECT c.id FROM chat_conversations c
    JOIN chat_conversation_members m1 ON m1."conversationId" = c.id AND m1."userId" = $1
    JOIN chat_conversation_members m2 ON m2."conversationId" = c.id AND m2."userId" = $2
    WHERE c.type = 'direct'
    AND (SELECT COUNT(*) FROM chat_conversation_members WHERE "conversationId" = c.id) = 2
    LIMIT 1
  `, [userId1, userId2]);

  if (existing.rows[0]) return existing.rows[0].id;

  const conv = await pool.query(
    'INSERT INTO chat_conversations (type) VALUES ($1) RETURNING id',
    ['direct']
  );
  const convId = conv.rows[0].id;

  await pool.query(
    'INSERT INTO chat_conversation_members ("conversationId", "userId") VALUES ($1, $2), ($1, $3)',
    [convId, userId1, userId2]
  );

  return convId;
};

const criarGrupo = async (userId, name, memberIds) => {
  const conv = await pool.query(
    'INSERT INTO chat_conversations (type, name) VALUES ($1, $2) RETURNING id',
    ['group', name]
  );
  const convId = conv.rows[0].id;

  const allMembers = [userId, ...memberIds.filter((id) => id !== userId)];
  for (const memberId of allMembers) {
    await pool.query(
      'INSERT INTO chat_conversation_members ("conversationId", "userId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [convId, memberId]
    );
  }

  return convId;
};

const listarConversasDoUsuario = async (userId) => {
  const query = `
    SELECT
      c.id, c.type, c.name,
      lm.content AS "lastMessage",
      lm."createdAt" AS "lastMessageAt",
      lm."senderName" AS "lastMessageSender",
      lm.type AS "lastMessageType",
      (
        SELECT json_agg(json_build_object('id', u.id, 'name', u.name, 'username', u.username))
        FROM chat_conversation_members cm2
        JOIN users u ON u.id = cm2."userId"
        WHERE cm2."conversationId" = c.id
      ) AS members
    FROM chat_conversations c
    JOIN chat_conversation_members cm ON cm."conversationId" = c.id AND cm."userId" = $1
    LEFT JOIN LATERAL (
      SELECT content, "createdAt", "senderName", type
      FROM chat_messages
      WHERE "conversationId" = c.id
      ORDER BY "createdAt" DESC
      LIMIT 1
    ) lm ON true
    ORDER BY COALESCE(lm."createdAt", c."createdAt") DESC
  `;
  const resultado = await pool.query(query, [userId]);
  return resultado.rows;
};

const buscarMensagens = async (conversationId, userId, limit = 50) => {
  const memberCheck = await pool.query(
    'SELECT id FROM chat_conversation_members WHERE "conversationId" = $1 AND "userId" = $2',
    [conversationId, userId]
  );
  if (!memberCheck.rows[0]) throw new Error('Acesso negado.');

  const resultado = await pool.query(
    `SELECT id, "conversationId", "senderId", "senderName", type, content,
            filename, "originalName", mimetype, size, "createdAt"
     FROM chat_messages WHERE "conversationId" = $1
     ORDER BY "createdAt" ASC LIMIT $2`,
    [conversationId, limit]
  );
  return resultado.rows;
};

const salvarMensagem = async (conversationId, senderId, { content, type = 'text', filename, originalName, mimetype, size }) => {
  const memberCheck = await pool.query(
    'SELECT id FROM chat_conversation_members WHERE "conversationId" = $1 AND "userId" = $2',
    [conversationId, senderId]
  );
  if (!memberCheck.rows[0]) throw new Error('Acesso negado.');

  const user = await pool.query('SELECT name FROM users WHERE id = $1', [senderId]);
  const senderName = user.rows[0]?.name || '';

  const resultado = await pool.query(
    `INSERT INTO chat_messages
       ("conversationId", "senderId", "senderName", type, content, filename, "originalName", mimetype, size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, "conversationId", "senderId", "senderName", type, content,
               filename, "originalName", mimetype, size, "createdAt"`,
    [conversationId, senderId, senderName, type, content || null,
      filename || null, originalName || null, mimetype || null, size || null]
  );
  return resultado.rows[0];
};

const buscarUsuarioPorUsername = async (query) => {
  const resultado = await pool.query(
    `SELECT id, name, username FROM users
     WHERE username ILIKE $1 OR name ILIKE $1
     LIMIT 10`,
    [`%${query}%`]
  );
  return resultado.rows;
};

module.exports = {
  criarConversaDireta,
  criarGrupo,
  listarConversasDoUsuario,
  buscarMensagens,
  salvarMensagem,
  buscarUsuarioPorUsername,
};
