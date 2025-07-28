import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * API route to send an invitation email to a partner.
 * Expects a POST body with: to (string), companyName (string), inviterEmail (string), fields (array of strings).
 * SMTP configuration must be provided via environment variables:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL.
 */
export async function POST(request: Request) {
  try {
    const { to, companyName, inviterEmail, fields } = await request.json();
    if (!to || !companyName || !inviterEmail) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    // Create transporter using SMTP credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    // Compose email
    const subject = `Invitation à consulter la fiche de ${companyName}`;
    const sharedList = Array.isArray(fields) && fields.length
      ? `Informations partagées : ${fields.join(', ')}`
      : 'Toutes les informations facultatives.';
    const html = `
      <p>Bonjour,</p>
      <p>${inviterEmail} vous invite à consulter la fiche de son entreprise <strong>${companyName}</strong> sur Fiich.</p>
      <p>${sharedList}</p>
      <p>Pour accepter l’invitation et consulter la fiche, connectez‑vous ou créez un compte sur Fiich.</p>
      <p>Cordialement,<br/>L’équipe Fiich</p>
    `;
    await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}