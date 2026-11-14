import {
  sendMailSafe,
  renderEmailLayout,
  formatRwfEmail,
  ADMIN_NOTIFICATION_EMAIL,
  SITE_URL,
} from './_email.ts';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { action, payload, origin } = body || {};
    const baseUrl = origin || SITE_URL;

    if (!action) {
      return res.status(400).json({ error: 'Missing "action" in request body' });
    }

    // ─────────────────────────────────────────────────────────────
    // 1. ORDER PLACED (Client confirmation + Admin alert)
    // ─────────────────────────────────────────────────────────────
    if (action === 'order_placed') {
      const {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        items = [],
        totalAmount = 0,
        paymentMethod = 'bank',
        paymentReference = '',
        status = 'pending',
      } = payload || {};

      if (!customerEmail || !orderNumber) {
        return res.status(400).json({ error: 'Missing customerEmail or orderNumber' });
      }

      const itemsListHtml = items.length > 0
        ? `<div class="card-box">
             <div style="font-weight: 700; color: #0f172a; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Enrolled Courses (${items.length}):</div>
             <table class="table-details">
               ${items
                 .map(
                   (item: any) => `
                 <tr>
                   <td class="td-label">${item.title}</td>
                   <td class="td-val">${formatRwfEmail(item.price || 0)}</td>
                 </tr>`
                 )
                 .join('')}
             </table>
           </div>`
        : '';

      const methodLabel =
        paymentMethod === 'pesapal'
          ? 'Pesapal (Card / MoMo)'
          : paymentMethod === 'momo'
          ? 'MTN Mobile Money'
          : 'Bank Transfer (Bank of Kigali)';

      // A. Client Confirmation Email
      const isAutoConfirmed = status === 'confirmed' || status === 'paid';
      const clientHtml = renderEmailLayout({
        title: isAutoConfirmed
          ? 'Order Confirmed & Access Granted!'
          : 'Order Received & Pending Verification',
        badge: isAutoConfirmed ? 'ORDER CONFIRMED' : 'ORDER PENDING VERIFICATION',
        badgeColor: isAutoConfirmed ? '#059669' : '#d97706',
        contentHtml: `
          <p>Hello <strong>${customerName || 'Valued Learner'}</strong>,</p>
          <p>
            ${
              isAutoConfirmed
                ? 'Thank you for your order! Your payment has been received and verified. Your courses are now unlocked in your Student Portal.'
                : 'Thank you for placing your order with FluentaRise Academy! We have received your order details and transaction reference. Our finance team verifies payments quickly (typically within 5 to 10 minutes).'
            }
          </p>

          <div class="card-box">
            <table class="table-details">
              <tr>
                <td class="td-label">Order Number</td>
                <td class="td-val"><span style="color: #0284c7; font-family: monospace; font-size: 15px;">#${orderNumber}</span></td>
              </tr>
              <tr>
                <td class="td-label">Total Amount</td>
                <td class="td-val" style="color: #0f172a; font-size: 16px; font-weight: 800;">${formatRwfEmail(totalAmount)}</td>
              </tr>
              <tr>
                <td class="td-label">Payment Method</td>
                <td class="td-val">${methodLabel}</td>
              </tr>
              ${
                paymentReference
                  ? `<tr>
                      <td class="td-label">Reference ID</td>
                      <td class="td-val"><code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${paymentReference}</code></td>
                    </tr>`
                  : ''
              }
              <tr>
                <td class="td-label">Status</td>
                <td class="td-val" style="color: ${isAutoConfirmed ? '#059669' : '#d97706'}; text-transform: capitalize;">${status}</td>
              </tr>
            </table>
          </div>

          ${itemsListHtml}

          <p style="font-size: 14px; color: #475569;">
            ${
              isAutoConfirmed
                ? 'You can now start learning immediately by visiting your student classroom.'
                : 'You can check your live order approval status anytime under <strong>Student Portal &gt; Order History</strong>.'
            }
          </p>
        `,
        cta: {
          label: isAutoConfirmed ? 'Access My Courses' : 'View Order Status',
          url: `${baseUrl}/student/orders`,
        },
        footerNote: 'Need urgent verification? Reach our support team on WhatsApp or call +250 795 041 000.',
      });

      // B. Admin Notification Email
      const adminHtml = renderEmailLayout({
        title: `New Order: #${orderNumber} (${formatRwfEmail(totalAmount)})`,
        badge: 'NEW ORDER RECEIVED',
        badgeColor: '#0284c7',
        contentHtml: `
          <p>A new course enrollment order has just been placed on the FluentaRise Academy platform.</p>

          <div class="card-box">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 10px; font-size: 14px; text-transform: uppercase;">Customer Information:</div>
            <table class="table-details">
              <tr>
                <td class="td-label">Customer Name</td>
                <td class="td-val">${customerName || 'N/A'}</td>
              </tr>
              <tr>
                <td class="td-label">Email</td>
                <td class="td-val"><a href="mailto:${customerEmail}">${customerEmail}</a></td>
              </tr>
              <tr>
                <td class="td-label">Phone</td>
                <td class="td-val"><a href="tel:${customerPhone}">${customerPhone || 'N/A'}</a></td>
              </tr>
            </table>
          </div>

          <div class="card-box">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 10px; font-size: 14px; text-transform: uppercase;">Order Details:</div>
            <table class="table-details">
              <tr>
                <td class="td-label">Order Number</td>
                <td class="td-val"><code style="font-size: 15px; font-weight: bold;">#${orderNumber}</code></td>
              </tr>
              <tr>
                <td class="td-label">Total Amount</td>
                <td class="td-val" style="font-size: 16px; font-weight: bold; color: #0284c7;">${formatRwfEmail(totalAmount)}</td>
              </tr>
              <tr>
                <td class="td-label">Payment Method</td>
                <td class="td-val">${methodLabel}</td>
              </tr>
              <tr>
                <td class="td-label">Payment Reference</td>
                <td class="td-val"><strong>${paymentReference || 'None provided'}</strong></td>
              </tr>
              <tr>
                <td class="td-label">Status</td>
                <td class="td-val" style="text-transform: capitalize;">${status}</td>
              </tr>
            </table>
          </div>

          ${itemsListHtml}
        `,
        cta: {
          label: 'Manage Orders in Admin Portal',
          url: `${baseUrl}/admin/orders`,
        },
      });

      // Dispatch both emails in parallel
      const [clientResult, adminResult] = await Promise.all([
        sendMailSafe({
          to: customerEmail,
          subject: `🎓 Order Confirmation: #${orderNumber} - FluentaRise Academy`,
          html: clientHtml,
        }),
        sendMailSafe({
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: `🔔 New Order Placed: #${orderNumber} by ${customerName} (${formatRwfEmail(totalAmount)})`,
          html: adminHtml,
        }),
      ]);

      return res.status(200).json({
        success: true,
        clientEmail: clientResult,
        adminEmail: adminResult,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. ORDER STATUS UPDATED (Client notified on every status change)
    // ─────────────────────────────────────────────────────────────
    if (action === 'order_status') {
      const {
        orderNumber,
        customerName,
        customerEmail,
        newStatus,
        totalAmount = 0,
        items = [],
        paymentReference = '',
        note = '',
      } = payload || {};

      if (!customerEmail || !orderNumber || !newStatus) {
        return res.status(400).json({ error: 'Missing customerEmail, orderNumber, or newStatus' });
      }

      const isPaid = newStatus === 'confirmed' || newStatus === 'paid';
      const isFailed = newStatus === 'failed' || newStatus === 'cancelled';
      const isRefunded = newStatus === 'refunded';

      let subject = `Order #${orderNumber} Status Update - FluentaRise Academy`;
      let badge = 'STATUS UPDATE';
      let badgeColor = '#0284c7';
      let title = `Update on Order #${orderNumber}`;
      let ctaLabel = 'View Order';
      let ctaUrl = `${baseUrl}/student/orders`;

      if (isPaid) {
        subject = `🎉 Payment Confirmed: Your Courses Are Unlocked! (Order #${orderNumber})`;
        badge = 'PAYMENT VERIFIED & ACTIVE';
        badgeColor = '#059669';
        title = 'Payment Confirmed! Your Learning Journey Begins 🚀';
        ctaLabel = 'Start Learning Now (My Courses)';
        ctaUrl = `${baseUrl}/student/courses`;
      } else if (isFailed) {
        subject = `⚠️ Action Needed: Payment Notice for Order #${orderNumber}`;
        badge = 'VERIFICATION ISSUE';
        badgeColor = '#dc2626';
        title = 'Payment Could Not Be Verified';
        ctaLabel = 'Review Order & Contact Support';
        ctaUrl = `${baseUrl}/student/orders`;
      } else if (isRefunded) {
        subject = `↩️ Refund Processed for Order #${orderNumber}`;
        badge = 'REFUNDED';
        badgeColor = '#64748b';
        title = 'Order Refund Processed';
      }

      const clientHtml = renderEmailLayout({
        title,
        badge,
        badgeColor,
        contentHtml: `
          <p>Hello <strong>${customerName || 'Valued Student'}</strong>,</p>
          <p>
            ${
              isPaid
                ? 'Great news! Your payment has been successfully confirmed by our administrative team. All lessons, assignments, and curriculum materials in your purchased courses are now unlocked!'
                : isFailed
                ? 'We were unable to verify the transaction reference provided for this order. Your course access is currently on hold. Please check your transaction details or reach out to our support team with your receipt.'
                : `The status of your order #${orderNumber} has been updated to <strong>${newStatus}</strong>.`
            }
          </p>

          <div class="card-box">
            <table class="table-details">
              <tr>
                <td class="td-label">Order Reference</td>
                <td class="td-val"><code style="font-size: 15px;">#${orderNumber}</code></td>
              </tr>
              <tr>
                <td class="td-label">New Status</td>
                <td class="td-val" style="color: ${badgeColor}; font-weight: bold; text-transform: uppercase;">${newStatus}</td>
              </tr>
              ${
                totalAmount
                  ? `<tr>
                      <td class="td-label">Total Amount</td>
                      <td class="td-val">${formatRwfEmail(totalAmount)}</td>
                    </tr>`
                  : ''
              }
              ${
                paymentReference
                  ? `<tr>
                      <td class="td-label">Payment Reference</td>
                      <td class="td-val"><code>${paymentReference}</code></td>
                    </tr>`
                  : ''
              }
            </table>
          </div>

          ${
            note
              ? `<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #92400e;">
                  <strong>Note from FluentaRise Team:</strong> ${note}
                </div>`
              : ''
          }

          ${
            isPaid && items.length > 0
              ? `<div class="card-box">
                  <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Unlocked Courses:</div>
                  <ul style="margin: 0; padding-left: 20px; color: #334155;">
                    ${items.map((i: any) => `<li style="margin-bottom: 4px;"><strong>${i.title}</strong></li>`).join('')}
                  </ul>
                </div>`
              : ''
          }
        `,
        cta: {
          label: ctaLabel,
          url: ctaUrl,
        },
        footerNote: 'Questions regarding your order? Call +250 795 041 000 or email fluentarisee@gmail.com.',
      });

      const result = await sendMailSafe({
        to: customerEmail,
        subject,
        html: clientHtml,
      });

      return res.status(200).json({ success: true, result });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. ACCOUNT CREATED (Student or Instructor signup notification)
    // ─────────────────────────────────────────────────────────────
    if (action === 'account_created') {
      const {
        name,
        email,
        phone = '',
        role = 'student',
        status = 'pending',
        userId,
      } = payload || {};

      if (!email || !name) {
        return res.status(400).json({ error: 'Missing name or email' });
      }

      const isInstructor = role === 'instructor';

      // A. User Welcome Email
      const userHtml = renderEmailLayout({
        title: isInstructor
          ? `Instructor Application Received, ${name}!`
          : `Welcome to FluentaRise Academy, ${name}! 🎉`,
        badge: isInstructor ? 'INSTRUCTOR APPLICATION' : 'REGISTRATION RECEIVED',
        badgeColor: isInstructor ? '#7c3aed' : '#0284c7',
        contentHtml: `
          <p>Hello <strong>${name}</strong>,</p>
          <p>
            ${
              isInstructor
                ? 'Thank you for your interest in joining FluentaRise Academy as an Instructor! We have received your application and profile details.'
                : 'Welcome to FluentaRise Academy! Your registration has been received successfully. We are excited to support your English fluency, test preparation, and professional communications journey.'
            }
          </p>

          <div class="card-box">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Your Account Profile:</div>
            <table class="table-details">
              <tr>
                <td class="td-label">Full Name</td>
                <td class="td-val">${name}</td>
              </tr>
              <tr>
                <td class="td-label">Email Address</td>
                <td class="td-val">${email}</td>
              </tr>
              <tr>
                <td class="td-label">Account Role</td>
                <td class="td-val" style="text-transform: capitalize;">${role}</td>
              </tr>
              <tr>
                <td class="td-label">Current Status</td>
                <td class="td-val" style="color: #d97706; font-weight: bold; text-transform: uppercase;">${status}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; margin: 20px 0; font-size: 14px; color: #166534;">
            <strong>Next Step:</strong> To safeguard student security and academic quality, all new accounts are quickly reviewed by our Super Admin. As soon as your account is approved, you will receive an approval email notification and can immediately sign in.
          </div>
        `,
        cta: {
          label: 'Visit FluentaRise Academy',
          url: `${baseUrl}`,
        },
        footerNote: 'If you have any questions, feel free to contact us at fluentarisee@gmail.com.',
      });

      // B. Admin Notification Email
      const adminHtml = renderEmailLayout({
        title: `New ${role.toUpperCase()} Registered: ${name}`,
        badge: 'NEW REGISTRATION ALERT',
        badgeColor: '#f59e0b',
        contentHtml: `
          <p>A new user has just registered on the FluentaRise Academy platform and is waiting for your review.</p>

          <div class="card-box">
            <table class="table-details">
              <tr>
                <td class="td-label">User ID</td>
                <td class="td-val"><code>${userId || 'N/A'}</code></td>
              </tr>
              <tr>
                <td class="td-label">Full Name</td>
                <td class="td-val"><strong>${name}</strong></td>
              </tr>
              <tr>
                <td class="td-label">Email</td>
                <td class="td-val"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td class="td-label">Phone</td>
                <td class="td-val">${phone || 'N/A'}</td>
              </tr>
              <tr>
                <td class="td-label">Requested Role</td>
                <td class="td-val" style="font-weight: bold; color: #0284c7; text-transform: uppercase;">${role}</td>
              </tr>
              <tr>
                <td class="td-label">Account Status</td>
                <td class="td-val" style="color: #d97706; font-weight: bold; text-transform: uppercase;">${status}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #475569;">
            Click the button below to review and approve this account in the Super Admin dashboard.
          </p>
        `,
        cta: {
          label: 'Review in User Management',
          url: `${baseUrl}/admin/users`,
        },
      });

      const [userResult, adminResult] = await Promise.all([
        sendMailSafe({
          to: email,
          subject: isInstructor
            ? '🎓 FluentaRise Instructor Application Received'
            : `🎉 Welcome to FluentaRise Academy, ${name}!`,
          html: userHtml,
        }),
        sendMailSafe({
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: `👤 New ${role.toUpperCase()} Registration: ${name} (${email})`,
          html: adminHtml,
        }),
      ]);

      return res.status(200).json({
        success: true,
        userEmail: userResult,
        adminEmail: adminResult,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. ACCOUNT APPROVED (Student or Instructor gets approved)
    // ─────────────────────────────────────────────────────────────
    if (action === 'account_approved') {
      const { name, email, role = 'student' } = payload || {};

      if (!email || !name) {
        return res.status(400).json({ error: 'Missing name or email' });
      }

      const isInstructor = role === 'instructor';
      const portalPath = isInstructor ? '/instructor' : '/student';

      const approvedHtml = renderEmailLayout({
        title: `Congratulations ${name}! Your Account is Approved 🎉`,
        badge: 'ACCOUNT ACTIVATED & READY',
        badgeColor: '#059669',
        contentHtml: `
          <p>Hello <strong>${name}</strong>,</p>
          <p>
            ${
              isInstructor
                ? 'We are delighted to inform you that your Instructor account at FluentaRise Academy has been reviewed and approved! You now have full access to create courses, manage curriculum chapters, host live sessions, and grade student submissions.'
                : 'Exciting news! Your FluentaRise student account has been approved and activated by our administration team. You now have full access to explore our accredited curriculum, enroll in courses, attend live interactive classes, and earn verified certifications.'
            }
          </p>

          <div class="card-box">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Your Activated Credentials:</div>
            <table class="table-details">
              <tr>
                <td class="td-label">Full Name</td>
                <td class="td-val">${name}</td>
              </tr>
              <tr>
                <td class="td-label">Registered Email</td>
                <td class="td-val"><strong>${email}</strong></td>
              </tr>
              <tr>
                <td class="td-label">Portal Access</td>
                <td class="td-val" style="color: #059669; font-weight: bold; text-transform: capitalize;">${role} Portal</td>
              </tr>
              <tr>
                <td class="td-label">Status</td>
                <td class="td-val" style="color: #059669; font-weight: bold;">ACTIVE & VERIFIED</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #475569;">
            Click below to sign into your account and access your dedicated ${role} portal.
          </p>
        `,
        cta: {
          label: 'Sign In to Your Dashboard',
          url: `${baseUrl}/login`,
        },
        footerNote: 'Need help getting started? Our support desk is available at fluentarisee@gmail.com.',
      });

      const result = await sendMailSafe({
        to: email,
        subject: `🚀 Your FluentaRise ${isInstructor ? 'Instructor' : 'Student'} Account is Approved!`,
        html: approvedHtml,
      });

      return res.status(200).json({ success: true, result });
    }

    // ─────────────────────────────────────────────────────────────
    // 5. CONTACT FORM SUBMISSION
    // ─────────────────────────────────────────────────────────────
    if (action === 'contact_form') {
      const { name, email, subject = 'General Inquiry', message } = payload || {};

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing name, email, or message' });
      }

      // Sender confirmation
      const senderHtml = renderEmailLayout({
        title: `We've Received Your Message`,
        badge: 'MESSAGE RECEIVED',
        badgeColor: '#0284c7',
        contentHtml: `
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to FluentaRise Academy. We have safely received your inquiry regarding <strong>"${subject}"</strong>.</p>
          <p>One of our academic counselors will review your message and get back to you within 24 hours.</p>

          <div class="card-box">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">Your Message Copy:</div>
            <blockquote style="margin: 0; padding: 10px 14px; background: #ffffff; border-radius: 8px; border-left: 3px solid #0284c7; color: #475569; font-style: italic;">
              ${message.replace(/\n/g, '<br/>')}
            </blockquote>
          </div>
        `,
        cta: {
          label: 'Browse Available Courses',
          url: `${baseUrl}/courses`,
        },
      });

      // Admin notification
      const adminHtml = renderEmailLayout({
        title: `New Contact Inquiry from ${name}`,
        badge: 'CONTACT INQUIRY',
        badgeColor: '#0284c7',
        contentHtml: `
          <p>A new message has been submitted through the FluentaRise website contact form.</p>

          <div class="card-box">
            <table class="table-details">
              <tr>
                <td class="td-label">Sender Name</td>
                <td class="td-val"><strong>${name}</strong></td>
              </tr>
              <tr>
                <td class="td-label">Sender Email</td>
                <td class="td-val"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td class="td-label">Subject</td>
                <td class="td-val"><strong>${subject}</strong></td>
              </tr>
            </table>
          </div>

          <div class="card-box">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Message Content:</div>
            <div style="background: #ffffff; padding: 14px; border-radius: 8px; font-size: 14px; color: #1e293b; line-height: 1.6;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
        cta: {
          label: `Reply Directly to ${name}`,
          url: `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`,
        },
      });

      const [senderResult, adminResult] = await Promise.all([
        sendMailSafe({
          to: email,
          subject: `We've received your message - FluentaRise Academy`,
          html: senderHtml,
        }),
        sendMailSafe({
          to: ADMIN_NOTIFICATION_EMAIL,
          replyTo: email,
          subject: `📩 Contact Form: "${subject}" from ${name}`,
          html: adminHtml,
        }),
      ]);

      return res.status(200).json({
        success: true,
        senderEmail: senderResult,
        adminEmail: adminResult,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 6. ASSIGNMENT GRADED NOTIFICATION
    // ─────────────────────────────────────────────────────────────
    if (action === 'assignment_graded') {
      const {
        studentName,
        studentEmail,
        taskTitle,
        courseTitle,
        score,
        maxScore = 100,
        feedback,
        improvementTips,
      } = payload || {};

      if (!studentEmail || !taskTitle) {
        return res.status(400).json({ error: 'Missing studentEmail or taskTitle' });
      }

      const percent = Math.round((Number(score) / Number(maxScore)) * 100);
      const isPass = percent >= 60;

      const gradedHtml = renderEmailLayout({
        title: `Your Assignment Has Been Graded: ${taskTitle}`,
        badge: isPass ? 'ASSIGNMENT GRADED' : 'RESUBMISSION REQUESTED',
        badgeColor: isPass ? '#059669' : '#d97706',
        contentHtml: `
          <p>Hello <strong>${studentName || 'Student'}</strong>,</p>
          <p>Your instructor has reviewed and graded your submission for <strong>${taskTitle}</strong> in the course <em>${courseTitle || 'FluentaRise Academy'}</em>.</p>

          <div class="card-box" style="text-align: center; padding: 24px;">
            <div style="font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px;">Your Score</div>
            <div style="font-size: 36px; font-weight: 900; color: ${isPass ? '#059669' : '#d97706'};">
              ${score} <span style="font-size: 20px; color: #94a3b8; font-weight: 500;">/ ${maxScore}</span>
            </div>
            <div style="font-size: 14px; font-weight: 600; color: #475569; margin-top: 4px;">(${percent}%)</div>
          </div>

          ${
            feedback
              ? `<div class="card-box">
                  <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Instructor Feedback:</div>
                  <div style="background: #ffffff; padding: 14px; border-radius: 8px; font-size: 14px; color: #334155; line-height: 1.6; border-left: 3px solid #0284c7;">
                    ${feedback.replace(/\n/g, '<br/>')}
                  </div>
                </div>`
              : ''
          }

          ${
            improvementTips
              ? `<div class="card-box" style="border-left: 4px solid #10b981; background: #f0fdf4;">
                  <div style="font-weight: 700; color: #065f46; margin-bottom: 8px;">💡 Areas to Improve & Recommendations:</div>
                  <div style="font-size: 14px; color: #166534; line-height: 1.6;">
                    ${improvementTips.replace(/\n/g, '<br/>')}
                  </div>
                </div>`
              : ''
          }
        `,
        cta: {
          label: 'View Submission Details in Student Portal',
          url: `${baseUrl}/student/tasks`,
        },
      });

      const result = await sendMailSafe({
        to: studentEmail,
        subject: `📝 Grade & Feedback Available: ${taskTitle} (${score}/${maxScore})`,
        html: gradedHtml,
      });

      return res.status(200).json({ success: true, result });
    }

    // ─────────────────────────────────────────────────────────────
    // 7. LIVE CLASS SCHEDULED NOTIFICATION
    // ─────────────────────────────────────────────────────────────
    if (action === 'live_class_scheduled') {
      const {
        sessionTitle,
        courseTitle,
        instructorName,
        date,
        startTime,
        endTime,
        meetingUrl,
        description,
        studentEmails = [],
      } = payload || {};

      if (!sessionTitle || !studentEmails.length) {
        return res.status(400).json({ error: 'Missing sessionTitle or studentEmails' });
      }

      const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : date;

      const liveClassHtml = renderEmailLayout({
        title: `Upcoming Live Class: ${sessionTitle}`,
        badge: 'LIVE CLASS SCHEDULED',
        badgeColor: '#0284c7',
        contentHtml: `
          <p>Hello Learner,</p>
          <p>A new live interactive class has been scheduled for your enrolled course <strong>${courseTitle || 'FluentaRise Academy'}</strong>!</p>

          <div class="card-box">
            <table class="table-details">
              <tr>
                <td class="td-label">Session Topic</td>
                <td class="td-val"><strong>${sessionTitle}</strong></td>
              </tr>
              <tr>
                <td class="td-label">Course</td>
                <td class="td-val">${courseTitle}</td>
              </tr>
              <tr>
                <td class="td-label">Instructor</td>
                <td class="td-val">${instructorName || 'Lead Instructor'}</td>
              </tr>
              <tr>
                <td class="td-label">Date</td>
                <td class="td-val">${formattedDate}</td>
              </tr>
              <tr>
                <td class="td-label">Time</td>
                <td class="td-val"><strong>${startTime} — ${endTime} (CAT)</strong></td>
              </tr>
            </table>
          </div>

          ${
            description
              ? `<div class="card-box">
                  <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">Agenda & Preparation:</div>
                  <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">${description.replace(/\n/g, '<br/>')}</p>
                </div>`
              : ''
          }

          <p style="font-size: 13px; color: #64748b; margin-top: 15px;">
            The "Join Live Class" button will automatically unlock on your FluentaRise Student Portal at the scheduled start time (with early check-in 15 minutes prior).
          </p>
        `,
        cta: {
          label: 'Join Live Class on FluentaRise',
          url: `${baseUrl}/student/live-classes`,
        },
      });

      // Send to each enrolled student
      const sendPromises = studentEmails.map((email: string) =>
        sendMailSafe({
          to: email,
          subject: `🔴 Live Class Reminder: ${sessionTitle} (${formattedDate} at ${startTime})`,
          html: liveClassHtml,
        })
      );

      const results = await Promise.all(sendPromises);
      return res.status(200).json({ success: true, count: results.length, results });
    }

    // ─────────────────────────────────────────────────────────────
    // 7. TEST / DIAGNOSTIC
    // ─────────────────────────────────────────────────────────────
    if (action === 'test') {
      const targetEmail = payload?.to || ADMIN_NOTIFICATION_EMAIL;
      const testHtml = renderEmailLayout({
        title: 'FluentaRise Email Test Verification',
        badge: 'SMTP DIAGNOSTIC TEST',
        badgeColor: '#059669',
        contentHtml: `
          <p>This is a test notification confirming that the FluentaRise Academy automated email dispatch engine is configured and operational.</p>
          <div class="card-box">
            <p style="margin: 0; font-size: 14px;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p style="margin: 6px 0 0 0; font-size: 14px;"><strong>Sender Account:</strong> fluentarisee@gmail.com</p>
          </div>
        `,
      });

      const result = await sendMailSafe({
        to: targetEmail,
        subject: '✅ FluentaRise Academy: Email System Diagnostic Test',
        html: testHtml,
      });

      return res.status(200).json({ success: result.success, result });
    }

    return res.status(400).json({ error: `Unknown action: "${action}"` });
  } catch (error: any) {
    console.error('Email API handler error:', error);
    return res.status(500).json({
      error: error.message || 'Internal Server Error dispatching email',
    });
  }
}
