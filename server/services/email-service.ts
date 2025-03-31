import nodemailer from 'nodemailer';

// En un entorno de producción, configurarías un servicio real como SendGrid, Mailgun, etc.
// Para desarrollo, podemos usar un servicio de prueba o ethereal.email

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

/**
 * Envía un correo de verificación al usuario recién registrado
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: `"Finance App" <${process.env.EMAIL_FROM || 'finanzas@ejemplo.com'}>`,
    to: email,
    subject: 'Verifica tu correo electrónico',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Verifica tu correo electrónico</h2>
        <p>Gracias por registrarte en Finance App. Por favor, verifica tu correo electrónico haciendo clic en el botón de abajo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verificar mi correo electrónico
          </a>
        </div>
        <p>O copia y pega el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no solicitaste este correo, puedes ignorarlo.</p>
        <hr style="border: 1px solid #eaeaea; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 0.9em;">© ${new Date().getFullYear()} Finance App. Todos los derechos reservados.</p>
      </div>
    `,
  });
}

/**
 * Envía un código de autenticación de dos factores
 */
export async function sendTwoFactorCode(email: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: `"Finance App" <${process.env.EMAIL_FROM || 'finanzas@ejemplo.com'}>`,
    to: email,
    subject: 'Código de verificación para iniciar sesión',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Código de verificación</h2>
        <p>Has solicitado iniciar sesión en Finance App. Para completar el proceso, introduce el siguiente código:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 24px; letter-spacing: 8px; background-color: #f3f4f6; padding: 15px; border-radius: 5px; font-weight: bold;">
            ${code}
          </div>
        </div>
        <p>Este código expirará en 15 minutos.</p>
        <p>Si no has intentado iniciar sesión, cambia tu contraseña inmediatamente.</p>
        <hr style="border: 1px solid #eaeaea; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 0.9em;">© ${new Date().getFullYear()} Finance App. Todos los derechos reservados.</p>
      </div>
    `,
  });
}

/**
 * Envía un enlace para restablecer la contraseña
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: `"Finance App" <${process.env.EMAIL_FROM || 'finanzas@ejemplo.com'}>`,
    to: email,
    subject: 'Restablece tu contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Restablece tu contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Restablecer contraseña
          </a>
        </div>
        <p>O copia y pega el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #4f46e5;">${resetUrl}</p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
        <hr style="border: 1px solid #eaeaea; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 0.9em;">© ${new Date().getFullYear()} Finance App. Todos los derechos reservados.</p>
      </div>
    `,
  });
}

/**
 * Verificar la configuración de correo y devolver un objeto de prueba
 * Útil para entornos de desarrollo donde no se envían correos reales
 */
export async function getTestEmailAccount() {
  // Si ya tenemos credenciales configuradas, las usamos
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    };
  }

  // De lo contrario, creamos una cuenta de prueba en ethereal.email
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Cuenta de correo de prueba creada:', testAccount);
    
    // Actualizamos el transportador con las credenciales de prueba
    transporter.options.auth = {
      user: testAccount.user,
      pass: testAccount.pass
    };
    
    return testAccount;
  } catch (error) {
    console.error('Error al crear cuenta de correo de prueba:', error);
    throw new Error('No se pudo configurar el servicio de correo electrónico');
  }
}