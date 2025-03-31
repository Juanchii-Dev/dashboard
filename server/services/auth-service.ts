import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { 
  User, 
  InsertUser, 
  RegisterUser, 
  VerificationToken,
  InsertVerificationToken,
  InsertSession
} from '../../shared/schema';
import { IStorage } from '../storage';
import { sendVerificationEmail, sendTwoFactorCode, sendPasswordResetEmail } from './email-service';

// Secreto para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiame_en_produccion';
const TOKEN_EXPIRY = '7d'; // 7 días

/**
 * Encripta una contraseña
 */
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compara una contraseña sin encriptar con una encriptada
 */
async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Genera un token aleatorio
 */
function generateToken(length = 40): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Genera un código numérico para autenticación de dos factores
 */
function generateTwoFactorCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Genera un token JWT
 */
function generateJWT(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verifica un token JWT
 */
function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Crea un token de verificación para un usuario
 */
async function createVerificationToken(
  storage: IStorage, 
  userId: number, 
  type: 'email_verification' | 'password_reset' | 'two_factor',
  expiryHours = 24
): Promise<string> {
  const token = type === 'two_factor' ? generateTwoFactorCode() : generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  const tokenData: InsertVerificationToken = {
    user_id: userId,
    token,
    type,
    expires_at: expiresAt,
  };

  await storage.createVerificationToken(tokenData);
  return token;
}

/**
 * Registra un nuevo usuario
 */
export async function registerUser(storage: IStorage, userData: RegisterUser): Promise<{ user: User; token: string }> {
  // Verificar si el correo ya está registrado
  const existingUser = await storage.getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado');
  }

  // Verificar si el nombre de usuario ya existe (si se proporcionó)
  if (userData.username) {
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error('El nombre de usuario ya está en uso');
    }
  }

  // Encriptar la contraseña
  const hashedPassword = await hashPassword(userData.password);

  // Crear el usuario - Para desarrollo, marcamos el email como verificado automáticamente
  const newUser = await storage.createUser({
    email: userData.email,
    password: hashedPassword,
    username: userData.username || null,
    name: userData.name || null,
  });

  // En un entorno de desarrollo, marcamos el email como verificado
  await storage.updateUserEmailVerification(newUser.id, true);

  // En producción, enviaríamos un correo de verificación
  // const verificationToken = await createVerificationToken(storage, newUser.id, 'email_verification');
  // await sendVerificationEmail(newUser.email, verificationToken);

  // Generar JWT para la sesión inicial
  const token = generateJWT(newUser);

  return { user: newUser, token };
}

/**
 * Verifica el correo electrónico de un usuario
 */
export async function verifyEmail(storage: IStorage, token: string): Promise<boolean> {
  // Buscar el token
  const verificationToken = await storage.getVerificationTokenByToken(token);

  if (!verificationToken || 
      verificationToken.type !== 'email_verification' || 
      verificationToken.used || 
      verificationToken.expires_at < new Date()) {
    return false;
  }

  // Marcar el token como usado
  await storage.markVerificationTokenAsUsed(verificationToken.id);

  // Actualizar el usuario
  await storage.updateUserEmailVerification(verificationToken.user_id, true);

  return true;
}

/**
 * Inicia sesión de un usuario
 */
export async function loginUser(
  storage: IStorage, 
  email: string, 
  password: string, 
  ipAddress?: string, 
  userAgent?: string
): Promise<{ user: User; token: string; requireTwoFactor: boolean }> {
  // Buscar el usuario
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // Verificar la contraseña
  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Credenciales inválidas');
  }

  // Si el usuario no ha verificado su correo, no permitir el inicio de sesión
  if (!user.email_verified) {
    // Regenerar token de verificación
    const verificationToken = await createVerificationToken(storage, user.id, 'email_verification');
    await sendVerificationEmail(user.email, verificationToken);
    
    throw new Error('Debes verificar tu correo electrónico antes de iniciar sesión. Se ha enviado un nuevo correo de verificación.');
  }

  // Implementación de 2FA - En un sistema real, consultaríamos si el usuario tiene 2FA activado
  const requireTwoFactor = false; // Por ahora, lo dejamos en false para simplificar

  if (requireTwoFactor) {
    // Generar código 2FA y enviarlo por correo
    const twoFactorCode = await createVerificationToken(storage, user.id, 'two_factor', 1); // Expira en 1 hora
    await sendTwoFactorCode(user.email, twoFactorCode);
    
    return { user, token: '', requireTwoFactor: true };
  }

  // Actualizar el último inicio de sesión
  await storage.updateUserLastLogin(user.id);

  // Crear sesión
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

  const sessionData: InsertSession = {
    user_id: user.id,
    token: generateToken(),
    expires_at: expiresAt,
    ip_address: ipAddress,
    user_agent: userAgent,
  };

  await storage.createSession(sessionData);

  // Generar JWT
  const token = generateJWT(user);

  return { user, token, requireTwoFactor: false };
}

/**
 * Verifica el código de autenticación de dos factores
 */
export async function verifyTwoFactorCode(
  storage: IStorage, 
  email: string, 
  code: string
): Promise<{ user: User; token: string }> {
  // Buscar el usuario
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Buscar el token
  const verificationToken = await storage.getVerificationTokenByUserAndType(user.id, 'two_factor');
  
  if (!verificationToken || 
      verificationToken.token !== code || 
      verificationToken.used || 
      verificationToken.expires_at < new Date()) {
    throw new Error('Código de verificación inválido o expirado');
  }

  // Marcar el token como usado
  await storage.markVerificationTokenAsUsed(verificationToken.id);

  // Actualizar el último inicio de sesión
  await storage.updateUserLastLogin(user.id);

  // Generar JWT
  const token = generateJWT(user);

  return { user, token };
}

/**
 * Inicia el proceso de restablecimiento de contraseña
 */
export async function requestPasswordReset(storage: IStorage, email: string): Promise<boolean> {
  // Buscar el usuario
  const user = await storage.getUserByEmail(email);
  if (!user) {
    // No informamos si el usuario existe o no por razones de seguridad
    return false;
  }

  // Crear token de restablecimiento
  const resetToken = await createVerificationToken(storage, user.id, 'password_reset', 1); // Expira en 1 hora

  // Enviar correo
  await sendPasswordResetEmail(user.email, resetToken);

  return true;
}

/**
 * Restablece la contraseña de un usuario
 */
export async function resetPassword(storage: IStorage, token: string, newPassword: string): Promise<boolean> {
  // Buscar el token
  const verificationToken = await storage.getVerificationTokenByToken(token);
  
  if (!verificationToken || 
      verificationToken.type !== 'password_reset' || 
      verificationToken.used || 
      verificationToken.expires_at < new Date()) {
    return false;
  }

  // Encriptar la nueva contraseña
  const hashedPassword = await hashPassword(newPassword);

  // Actualizar la contraseña
  await storage.updateUserPassword(verificationToken.user_id, hashedPassword);

  // Marcar el token como usado
  await storage.markVerificationTokenAsUsed(verificationToken.id);

  // Invalidar todas las sesiones existentes del usuario
  await storage.deleteUserSessions(verificationToken.user_id);

  return true;
}

/**
 * Cierra la sesión de un usuario
 */
export async function logoutUser(storage: IStorage, token: string): Promise<boolean> {
  return storage.deleteSessionByToken(token);
}

export { verifyJWT };