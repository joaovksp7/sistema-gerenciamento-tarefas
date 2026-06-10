process.env.JWT_SECRET = 'chave_de_teste';

const jwt = require('jsonwebtoken');
const verificarToken = require('../middlewares/authMiddleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  it('retorna 401 quando nenhum token é enviado', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 403 quando o token é inválido', () => {
    const req = { headers: { authorization: 'Bearer token_invalido' } };
    const res = mockRes();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('chama next() e injeta userId quando o token é válido', () => {
    const token = jwt.sign({ id: 'uuid-do-usuario' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe('uuid-do-usuario');
  });

  it('retorna 403 quando o token está expirado', () => {
    const token = jwt.sign({ id: 'uuid' }, process.env.JWT_SECRET, { expiresIn: '0s' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
