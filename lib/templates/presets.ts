export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  previewColor: string; // Color para el preview en la galería
  htmlContent: string;
  cssContent: string;
  qrSize?: number;
  suggestedQrPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "elegant-formal",
    name: "Elegante Formal",
    description: "Diseño clásico y sofisticado con tonos oscuros",
    previewColor: "#1a1a1a",
    qrSize: 180,
    suggestedQrPosition: "bottom-right",
    htmlContent: `
      <div class="invitation-container elegant">
        <div class="header-section">
          <div class="ornament-top"></div>
          <h1 class="event-title">{{eventName}}</h1>
          <div class="divider"></div>
        </div>
        <div class="content-section">
          <p class="greeting">Estimado/a <strong>{{name}}</strong>,</p>
          <p class="invitation-text">Tiene el honor de estar invitado/a a nuestro evento especial</p>
          <div class="details-box">
            <div class="detail-item">
              <span class="icon">📅</span>
              <div>
                <span class="detail-label">Fecha</span>
                <span class="detail-value">{{eventDate}}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="icon">📍</span>
              <div>
                <span class="detail-label">Ubicación</span>
                <span class="detail-value">{{eventLocation}}</span>
              </div>
            </div>
          </div>
          <div class="qr-container">
            {{qrImage}}
          </div>
        </div>
        <div class="footer-section">
          <div class="ornament-bottom"></div>
        </div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.elegant {
        max-width: 700px;
        margin: 0 auto;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        color: #f5f5f5;
        padding: 60px 40px;
        border-radius: 0;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      }
      .elegant .header-section {
        text-align: center;
        margin-bottom: 40px;
        position: relative;
      }
      .elegant .ornament-top, .elegant .ornament-bottom {
        height: 3px;
        background: linear-gradient(90deg, transparent, #d4af37, transparent);
        margin: 20px auto;
        width: 200px;
      }
      .elegant .event-title {
        font-size: 42px;
        font-weight: 300;
        letter-spacing: 4px;
        margin: 30px 0;
        color: #d4af37;
        text-transform: uppercase;
        font-family: 'Georgia', serif;
      }
      .elegant .divider {
        width: 100px;
        height: 1px;
        background: #d4af37;
        margin: 20px auto;
      }
      .elegant .content-section {
        text-align: center;
        line-height: 1.8;
      }
      .elegant .greeting {
        font-size: 18px;
        margin-bottom: 20px;
        color: #e0e0e0;
      }
      .elegant .invitation-text {
        font-size: 16px;
        margin-bottom: 40px;
        color: #c0c0c0;
        font-style: italic;
      }
      .elegant .details-box {
        background: rgba(255,255,255,0.05);
        padding: 30px;
        margin: 40px 0;
        border-left: 3px solid #d4af37;
      }
      .elegant .detail-item {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        text-align: left;
      }
      .elegant .detail-item:last-child {
        margin-bottom: 0;
      }
      .elegant .icon {
        font-size: 24px;
      }
      .elegant .detail-label {
        display: block;
        font-size: 12px;
        color: #d4af37;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px;
      }
      .elegant .detail-value {
        display: block;
        font-size: 16px;
        color: #f5f5f5;
      }
      .elegant .qr-container {
        margin-top: 40px;
        padding: 20px;
        background: rgba(255,255,255,0.05);
        display: inline-block;
      }
    `,
  },
  {
    id: "modern-minimal",
    name: "Moderno Minimalista",
    description: "Líneas limpias y espacios blancos",
    previewColor: "#ffffff",
    qrSize: 200,
    suggestedQrPosition: "bottom-right",
    htmlContent: `
      <div class="invitation-container modern">
        <div class="content-wrapper">
          <h1 class="event-name">{{eventName}}</h1>
          <p class="greeting">Hola {{name}}</p>
          <p class="description">Te invitamos cordialmente a nuestro evento</p>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-icon">📅</span>
              <div class="info-content">
                <span class="info-label">Fecha</span>
                <span class="info-value">{{eventDate}}</span>
              </div>
            </div>
            
            <div class="info-item">
              <span class="info-icon">📍</span>
              <div class="info-content">
                <span class="info-label">Lugar</span>
                <span class="info-value">{{eventLocation}}</span>
              </div>
            </div>
            
          </div>
          <div class="qr-wrapper">
            {{qrImage}}
          </div>
        </div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.modern {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        padding: 60px 40px;
        font-family: 'Helvetica Neue', Arial, sans-serif;
      }
      .modern .event-name {
        font-size: 48px;
        font-weight: 700;
        color: #000;
        margin-bottom: 20px;
        letter-spacing: -1px;
        line-height: 1.1;
      }
      .modern .greeting {
        font-size: 18px;
        color: #666;
        margin-bottom: 10px;
      }
      .modern .description {
        font-size: 16px;
        color: #999;
        margin-bottom: 50px;
      }
      .modern .info-grid {
        display: flex;
        flex-direction: column;
        gap: 30px;
        margin-bottom: 50px;
        padding-top: 40px;
        border-top: 1px solid #e0e0e0;
      }
      .modern .info-item {
        display: flex;
        align-items: flex-start;
        gap: 20px;
      }
      .modern .info-icon {
        font-size: 28px;
        line-height: 1;
      }
      .modern .info-content {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .modern .info-label {
        font-size: 12px;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .modern .info-value {
        font-size: 18px;
        color: #000;
        font-weight: 500;
      }
      .modern .qr-wrapper {
        text-align: center;
        padding: 30px;
        background: #f8f8f8;
      }
    `,
  },
  {
    id: "colorful-festive",
    name: "Festivo Colorido",
    description: "Colores vibrantes y alegres",
    previewColor: "#ff6b6b",
    qrSize: 200,
    suggestedQrPosition: "center",
    htmlContent: `
      <div class="invitation-container festive">
        <div class="celebration-header">
          <span class="emoji">🎉</span>
          <h1>{{eventName}}</h1>
          <span class="emoji">🎊</span>
        </div>
        <div class="main-content">
          <p class="hello">¡Hola {{name}}!</p>
          <p class="invite-text">¡Estás invitado/a a celebrar con nosotros!</p>
          <div class="party-details">
            <div class="party-item">
              <div class="party-icon">📅</div>
              <div class="party-info">
                <div class="party-label">Fecha</div>
                <div class="party-text">{{eventDate}}</div>
              </div>
            </div>
            
            <div class="party-item">
              <div class="party-icon">📍</div>
              <div class="party-info">
                <div class="party-label">Lugar</div>
                <div class="party-text">{{eventLocation}}</div>
              </div>
            </div>
            
          </div>
          <div class="qr-section">
            {{qrImage}}
          </div>
        </div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.festive {
        max-width: 650px;
        margin: 0 auto;
        background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6bcf7f 100%);
        padding: 50px 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(255,107,107,0.3);
      }
      .festive .celebration-header {
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-bottom: 30px;
      }
      .festive .emoji {
        font-size: 48px;
        animation: bounce 2s infinite;
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .festive h1 {
        font-size: 40px;
        color: #fff;
        font-weight: 800;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        margin: 0;
      }
      .festive .main-content {
        background: rgba(255,255,255,0.95);
        padding: 40px;
        border-radius: 15px;
        margin-top: 20px;
      }
      .festive .hello {
        font-size: 24px;
        color: #ff6b6b;
        font-weight: 700;
        margin-bottom: 10px;
      }
      .festive .invite-text {
        font-size: 18px;
        color: #333;
        margin-bottom: 30px;
      }
      .festive .party-details {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin: 30px 0;
      }
      .festive .party-item {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 20px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
        border-radius: 12px;
        color: #fff;
      }
      .festive .party-icon {
        font-size: 36px;
      }
      .festive .party-label {
        font-size: 12px;
        text-transform: uppercase;
        opacity: 0.9;
        margin-bottom: 5px;
      }
      .festive .party-text {
        font-size: 18px;
        font-weight: 700;
      }
      .festive .qr-section {
        text-align: center;
        margin-top: 30px;
        padding: 20px;
        background: #f8f8f8;
        border-radius: 12px;
      }
    `,
  },
  {
    id: "corporate-professional",
    name: "Corporativo Profesional",
    description: "Diseño empresarial y formal",
    previewColor: "#2563eb",
    qrSize: 180,
    suggestedQrPosition: "bottom-right",
    htmlContent: `
      <div class="invitation-container corporate">
        <div class="corporate-header">
          <div class="logo-area"></div>
          <h1 class="event-title">{{eventName}}</h1>
        </div>
        <div class="corporate-body">
          <p class="salutation">Estimado/a {{name}},</p>
          <p class="body-text">Nos complace extenderle una invitación formal para nuestro evento corporativo.</p>
          <table class="details-table">
            <tr>
              <td class="table-label">Fecha del Evento:</td>
              <td class="table-value">{{eventDate}}</td>
            </tr>
            
            <tr>
              <td class="table-label">Ubicación:</td>
              <td class="table-value">{{eventLocation}}</td>
            </tr>
            
          </table>
          <div class="qr-area">
            {{qrImage}}
            <p class="qr-note">Presente este código QR al llegar al evento</p>
          </div>
        </div>
        <div class="corporate-footer">
          <p>Esperamos contar con su presencia.</p>
        </div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.corporate {
        max-width: 700px;
        margin: 0 auto;
        background: #ffffff;
        border: 2px solid #2563eb;
        padding: 0;
        font-family: 'Arial', sans-serif;
      }
      .corporate .corporate-header {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }
      .corporate .logo-area {
        height: 60px;
        margin-bottom: 20px;
        border-bottom: 2px solid rgba(255,255,255,0.3);
      }
      .corporate .event-title {
        font-size: 32px;
        font-weight: 600;
        margin: 0;
        letter-spacing: 1px;
      }
      .corporate .corporate-body {
        padding: 40px;
        color: #1f2937;
        line-height: 1.8;
      }
      .corporate .salutation {
        font-size: 16px;
        margin-bottom: 15px;
        font-weight: 500;
      }
      .corporate .body-text {
        font-size: 15px;
        color: #4b5563;
        margin-bottom: 30px;
      }
      .corporate .details-table {
        width: 100%;
        border-collapse: collapse;
        margin: 30px 0;
        background: #f9fafb;
      }
      .corporate .details-table tr {
        border-bottom: 1px solid #e5e7eb;
      }
      .corporate .details-table td {
        padding: 15px 20px;
      }
      .corporate .table-label {
        font-weight: 600;
        color: #1f2937;
        width: 40%;
      }
      .corporate .table-value {
        color: #4b5563;
      }
      .corporate .qr-area {
        text-align: center;
        margin-top: 40px;
        padding: 30px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
      }
      .corporate .qr-note {
        font-size: 12px;
        color: #6b7280;
        margin-top: 15px;
      }
      .corporate .corporate-footer {
        background: #f9fafb;
        padding: 25px 40px;
        text-align: center;
        color: #4b5563;
        font-size: 14px;
        border-top: 1px solid #e5e7eb;
      }
    `,
  },
  {
    id: "romantic-wedding",
    name: "Boda Romántico",
    description: "Estilo elegante y romántico para bodas",
    previewColor: "#f8d7da",
    qrSize: 180,
    suggestedQrPosition: "center",
    htmlContent: `
      <div class="invitation-container romantic">
        <div class="romantic-header">
          <div class="floral-decoration">❀</div>
          <h1 class="wedding-title">{{eventName}}</h1>
          <div class="floral-decoration">❀</div>
        </div>
        <div class="romantic-content">
          <p class="greeting-romantic">Querido/a {{name}},</p>
          <p class="invitation-message">Nos llena de alegría invitarte a compartir este momento especial en nuestras vidas.</p>
          <div class="romantic-details">
            <div class="romantic-detail">
              <span class="detail-icon">📅</span>
              <div class="detail-text">
                <span class="detail-title">Fecha</span>
                <span class="detail-info">{{eventDate}}</span>
              </div>
            </div>
            
            <div class="romantic-detail">
              <span class="detail-icon">📍</span>
              <div class="detail-text">
                <span class="detail-title">Ceremonia</span>
                <span class="detail-info">{{eventLocation}}</span>
              </div>
            </div>
            
          </div>
          <div class="qr-romantic">
            {{qrImage}}
          </div>
        </div>
        <div class="romantic-closing">
          <p>Con amor y esperanza,</p>
          <p class="signature">Los Novios</p>
        </div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.romantic {
        max-width: 650px;
        margin: 0 auto;
        background: linear-gradient(to bottom, #fff5f5 0%, #ffe4e6 100%);
        padding: 50px 40px;
        border: 3px solid #fecdd3;
        box-shadow: 0 10px 40px rgba(254,205,211,0.3);
      }
      .romantic .romantic-header {
        text-align: center;
        margin-bottom: 40px;
      }
      .romantic .floral-decoration {
        font-size: 32px;
        color: #f472b6;
        margin: 15px 0;
      }
      .romantic .wedding-title {
        font-size: 44px;
        font-weight: 400;
        color: #9f1239;
        font-family: 'Georgia', serif;
        font-style: italic;
        margin: 20px 0;
      }
      .romantic .romantic-content {
        background: rgba(255,255,255,0.8);
        padding: 40px;
        border-radius: 10px;
        text-align: center;
      }
      .romantic .greeting-romantic {
        font-size: 20px;
        color: #881337;
        margin-bottom: 15px;
        font-style: italic;
      }
      .romantic .invitation-message {
        font-size: 16px;
        color: #4b5563;
        line-height: 1.8;
        margin-bottom: 35px;
      }
      .romantic .romantic-details {
        display: flex;
        flex-direction: column;
        gap: 25px;
        margin: 35px 0;
      }
      .romantic .romantic-detail {
        display: flex;
        align-items: center;
        gap: 20px;
        justify-content: center;
      }
      .romantic .detail-icon {
        font-size: 28px;
      }
      .romantic .detail-text {
        text-align: left;
      }
      .romantic .detail-title {
        display: block;
        font-size: 11px;
        color: #be185d;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 5px;
      }
      .romantic .detail-info {
        display: block;
        font-size: 18px;
        color: #881337;
        font-weight: 500;
      }
      .romantic .qr-romantic {
        margin-top: 35px;
        padding: 25px;
        background: #fff;
        border-radius: 10px;
        border: 2px dashed #fecdd3;
      }
      .romantic .romantic-closing {
        text-align: center;
        margin-top: 35px;
        color: #9f1239;
        font-style: italic;
      }
      .romantic .signature {
        font-size: 18px;
        font-weight: 600;
        margin-top: 10px;
      }
    `,
  },
  {
    id: "sport-dynamic",
    name: "Evento Deportivo",
    description: "Enérgico y dinámico para eventos deportivos",
    previewColor: "#10b981",
    qrSize: 200,
    suggestedQrPosition: "bottom-right",
    htmlContent: `
      <div class="invitation-container sport">
        <div class="sport-header">
          <div class="sport-badge">🏆</div>
          <h1>{{eventName}}</h1>
          <div class="sport-stripes"></div>
        </div>
        <div class="sport-body">
          <p class="sport-greeting">¡Hola {{name}}!</p>
          <p class="sport-invite">Te esperamos en este evento deportivo</p>
          <div class="sport-info">
            <div class="sport-detail">
              <span>📅</span>
              <div>
                <strong>Fecha</strong>
                <p>{{eventDate}}</p>
              </div>
            </div>
            
            <div class="sport-detail">
              <span>📍</span>
              <div>
                <strong>Cancha</strong>
                <p>{{eventLocation}}</p>
              </div>
            </div>
            
          </div>
          <div class="sport-qr">
            {{qrImage}}
          </div>
        </div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.sport {
        max-width: 650px;
        margin: 0 auto;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        padding: 40px;
        border-radius: 0;
        box-shadow: 0 15px 50px rgba(16,185,129,0.3);
      }
      .sport .sport-header {
        text-align: center;
        color: white;
        margin-bottom: 30px;
      }
      .sport .sport-badge {
        font-size: 64px;
        margin-bottom: 20px;
      }
      .sport h1 {
        font-size: 42px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin: 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      }
      .sport .sport-stripes {
        height: 8px;
        background: repeating-linear-gradient(
          90deg,
          white 0px,
          white 20px,
          transparent 20px,
          transparent 40px
        );
        margin-top: 20px;
      }
      .sport .sport-body {
        background: white;
        padding: 40px;
        border-radius: 10px;
      }
      .sport .sport-greeting {
        font-size: 24px;
        color: #059669;
        font-weight: 700;
        margin-bottom: 10px;
      }
      .sport .sport-invite {
        font-size: 16px;
        color: #4b5563;
        margin-bottom: 30px;
      }
      .sport .sport-info {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin: 30px 0;
        padding: 25px;
        background: #f0fdf4;
        border-left: 5px solid #10b981;
      }
      .sport .sport-detail {
        display: flex;
        align-items: flex-start;
        gap: 20px;
      }
      .sport .sport-detail span {
        font-size: 32px;
      }
      .sport .sport-detail strong {
        display: block;
        color: #059669;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px;
      }
      .sport .sport-detail p {
        margin: 0;
        color: #1f2937;
        font-size: 18px;
        font-weight: 600;
      }
      .sport .sport-qr {
        text-align: center;
        margin-top: 30px;
        padding: 25px;
        background: #ecfdf5;
        border-radius: 8px;
      }
    `,
  },
  {
    id: "birthday-fun",
    name: "Cumpleaños Divertido",
    description: "Celebración alegre y festiva",
    previewColor: "#f59e0b",
    qrSize: 200,
    suggestedQrPosition: "center",
    htmlContent: `
      <div class="invitation-container birthday">
        <div class="birthday-top">
          <span class="balloon">🎈</span>
          <h1>{{eventName}}</h1>
          <span class="balloon">🎈</span>
        </div>
        <div class="birthday-content">
          <p class="birthday-hello">¡Hola {{name}}! 🎂</p>
          <p class="birthday-text">Estás invitado/a a celebrar con nosotros</p>
          <div class="birthday-box">
            <div class="birthday-info">
              <span class="info-emoji">📅</span>
              <div>
                <span class="info-label">Fecha</span>
                <span class="info-text">{{eventDate}}</span>
              </div>
            </div>
            
            <div class="birthday-info">
              <span class="info-emoji">📍</span>
              <div>
                <span class="info-label">Lugar</span>
                <span class="info-text">{{eventLocation}}</span>
              </div>
            </div>
            
          </div>
          <div class="birthday-qr">
            {{qrImage}}
          </div>
        </div>
        <div class="birthday-footer">¡Esperamos verte! 🎉</div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.birthday {
        max-width: 600px;
        margin: 0 auto;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        padding: 40px;
        border-radius: 25px;
        box-shadow: 0 20px 60px rgba(245,158,11,0.4);
      }
      .birthday .birthday-top {
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin-bottom: 25px;
      }
      .birthday .balloon {
        font-size: 40px;
      }
      .birthday h1 {
        font-size: 38px;
        color: white;
        font-weight: 800;
        margin: 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      }
      .birthday .birthday-content {
        background: white;
        padding: 35px;
        border-radius: 20px;
        margin-top: 20px;
      }
      .birthday .birthday-hello {
        font-size: 26px;
        color: #f59e0b;
        font-weight: 700;
        margin-bottom: 10px;
        text-align: center;
      }
      .birthday .birthday-text {
        font-size: 17px;
        color: #4b5563;
        text-align: center;
        margin-bottom: 25px;
      }
      .birthday .birthday-box {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        padding: 25px;
        border-radius: 15px;
        margin: 25px 0;
      }
      .birthday .birthday-info {
        display: flex;
        align-items: center;
        gap: 18px;
        margin-bottom: 18px;
      }
      .birthday .birthday-info:last-child {
        margin-bottom: 0;
      }
      .birthday .info-emoji {
        font-size: 30px;
      }
      .birthday .info-label {
        display: block;
        font-size: 11px;
        color: #92400e;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }
      .birthday .info-text {
        display: block;
        font-size: 18px;
        color: #78350f;
        font-weight: 700;
      }
      .birthday .birthday-qr {
        text-align: center;
        margin-top: 25px;
        padding: 20px;
        background: #fffbeb;
        border-radius: 12px;
      }
      .birthday .birthday-footer {
        text-align: center;
        color: white;
        font-size: 20px;
        font-weight: 700;
        margin-top: 25px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
      }
    `,
  },
  {
    id: "conference-business",
    name: "Conferencia Empresarial",
    description: "Profesional y moderno para conferencias",
    previewColor: "#6366f1",
    qrSize: 180,
    suggestedQrPosition: "bottom-right",
    htmlContent: `
      <div class="invitation-container conference">
        <div class="conference-header">
          <h1 class="conference-title">{{eventName}}</h1>
          <p class="conference-subtitle">Conferencia Empresarial</p>
        </div>
        <div class="conference-main">
          <p class="dear">Estimado/a {{name}},</p>
          <p class="invitation-body">Es un placer invitarte a nuestra conferencia empresarial donde compartiremos conocimientos, tendencias y networking de alto nivel.</p>
          <div class="conference-schedule">
            <div class="schedule-item">
              <div class="schedule-icon">📅</div>
              <div class="schedule-content">
                <div class="schedule-label">Fecha y Hora</div>
                <div class="schedule-value">{{eventDate}}</div>
              </div>
            </div>
            
            <div class="schedule-item">
              <div class="schedule-icon">📍</div>
              <div class="schedule-content">
                <div class="schedule-label">Sede</div>
                <div class="schedule-value">{{eventLocation}}</div>
              </div>
            </div>
            
          </div>
          <div class="conference-qr">
            {{qrImage}}
            <p class="qr-instruction">Presenta este código QR al ingresar</p>
          </div>
        </div>
        <div class="conference-footer">
          <p>¡Te esperamos!</p>
        </div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.conference {
        max-width: 700px;
        margin: 0 auto;
        background: #ffffff;
        border-top: 5px solid #6366f1;
        box-shadow: 0 10px 40px rgba(99,102,241,0.15);
      }
      .conference .conference-header {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white;
        padding: 50px 40px;
        text-align: center;
      }
      .conference .conference-title {
        font-size: 36px;
        font-weight: 700;
        margin: 0 0 10px 0;
        letter-spacing: -0.5px;
      }
      .conference .conference-subtitle {
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 2px;
        opacity: 0.9;
        margin: 0;
      }
      .conference .conference-main {
        padding: 45px 40px;
        color: #1f2937;
        line-height: 1.7;
      }
      .conference .dear {
        font-size: 16px;
        margin-bottom: 15px;
        font-weight: 500;
      }
      .conference .invitation-body {
        font-size: 15px;
        color: #4b5563;
        margin-bottom: 35px;
      }
      .conference .conference-schedule {
        background: #f8fafc;
        border-left: 4px solid #6366f1;
        padding: 30px;
        margin: 35px 0;
      }
      .conference .schedule-item {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 25px;
      }
      .conference .schedule-item:last-child {
        margin-bottom: 0;
      }
      .conference .schedule-icon {
        font-size: 32px;
        line-height: 1;
      }
      .conference .schedule-label {
        font-size: 12px;
        color: #6366f1;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 6px;
        font-weight: 600;
      }
      .conference .schedule-value {
        font-size: 17px;
        color: #1f2937;
        font-weight: 600;
      }
      .conference .conference-qr {
        text-align: center;
        margin-top: 40px;
        padding: 35px;
        background: #eff6ff;
        border: 2px solid #dbeafe;
        border-radius: 8px;
      }
      .conference .qr-instruction {
        font-size: 13px;
        color: #4b5563;
        margin-top: 15px;
      }
      .conference .conference-footer {
        background: #f8fafc;
        padding: 25px 40px;
        text-align: center;
        color: #6366f1;
        font-weight: 600;
        font-size: 16px;
      }
    `,
  },
  {
    id: "gala-sophisticated",
    name: "Gala Sofisticado",
    description: "Lujo y elegancia para eventos de gala",
    previewColor: "#7c3aed",
    qrSize: 180,
    suggestedQrPosition: "bottom-right",
    htmlContent: `
      <div class="invitation-container gala">
        <div class="gala-top-border"></div>
        <div class="gala-content-wrapper">
          <div class="gala-header">
            <div class="gala-ornament">✦</div>
            <h1 class="gala-title">{{eventName}}</h1>
            <div class="gala-ornament">✦</div>
          </div>
          <div class="gala-body">
            <p class="gala-salutation">Querido/a {{name}},</p>
            <p class="gala-invitation">Tiene el honor de recibir esta invitación para nuestra gala exclusiva.</p>
            <div class="gala-details">
              <div class="gala-detail-row">
                <span class="gala-icon">📅</span>
                <div class="gala-detail-content">
                  <span class="gala-detail-label">Fecha y Hora</span>
                  <span class="gala-detail-value">{{eventDate}}</span>
                </div>
              </div>
              
              <div class="gala-detail-row">
                <span class="gala-icon">📍</span>
                <div class="gala-detail-content">
                  <span class="gala-detail-label">Venue</span>
                  <span class="gala-detail-value">{{eventLocation}}</span>
                </div>
              </div>
              
            </div>
            <div class="gala-qr">
              {{qrImage}}
            </div>
          </div>
        </div>
        <div class="gala-bottom-border"></div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.gala {
        max-width: 680px;
        margin: 0 auto;
        background: linear-gradient(to bottom, #ffffff 0%, #faf5ff 100%);
        border: 4px solid #7c3aed;
        box-shadow: 0 15px 50px rgba(124,58,237,0.25);
      }
      .gala .gala-top-border,
      .gala .gala-bottom-border {
        height: 8px;
        background: linear-gradient(90deg, #7c3aed 0%, #a78bfa 50%, #7c3aed 100%);
      }
      .gala .gala-content-wrapper {
        padding: 50px 45px;
      }
      .gala .gala-header {
        text-align: center;
        margin-bottom: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 25px;
      }
      .gala .gala-ornament {
        font-size: 28px;
        color: #7c3aed;
      }
      .gala .gala-title {
        font-size: 40px;
        font-weight: 400;
        color: #5b21b6;
        font-family: 'Georgia', serif;
        letter-spacing: 3px;
        margin: 0;
        text-transform: uppercase;
      }
      .gala .gala-body {
        text-align: center;
        color: #1f2937;
      }
      .gala .gala-salutation {
        font-size: 18px;
        margin-bottom: 18px;
        color: #4b5563;
        font-style: italic;
      }
      .gala .gala-invitation {
        font-size: 16px;
        color: #6b7280;
        line-height: 1.8;
        margin-bottom: 40px;
      }
      .gala .gala-details {
        background: rgba(124,58,237,0.05);
        padding: 35px;
        margin: 40px 0;
        border: 1px solid rgba(124,58,237,0.2);
      }
      .gala .gala-detail-row {
        display: flex;
        align-items: center;
        gap: 25px;
        margin-bottom: 28px;
        justify-content: center;
      }
      .gala .gala-detail-row:last-child {
        margin-bottom: 0;
      }
      .gala .gala-icon {
        font-size: 32px;
      }
      .gala .gala-detail-content {
        text-align: left;
      }
      .gala .gala-detail-label {
        display: block;
        font-size: 11px;
        color: #7c3aed;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 6px;
      }
      .gala .gala-detail-value {
        display: block;
        font-size: 18px;
        color: #1f2937;
        font-weight: 600;
      }
      .gala .gala-qr {
        margin-top: 40px;
        padding: 30px;
        background: rgba(255,255,255,0.8);
        border: 2px solid #c4b5fd;
        display: inline-block;
      }
    `,
  },
  {
    id: "casual-creative",
    name: "Casual Creativo",
    description: "Diseño moderno y relajado",
    previewColor: "#ec4899",
    qrSize: 200,
    suggestedQrPosition: "center",
    htmlContent: `
      <div class="invitation-container casual">
        <div class="casual-header">
          <h1>{{eventName}}</h1>
        </div>
        <div class="casual-main">
          <p class="casual-hi">Hola {{name}} 👋</p>
          <p class="casual-text">Te esperamos en este evento genial</p>
          <div class="casual-info-box">
            <div class="casual-info">
              <div class="casual-emoji">📅</div>
              <div class="casual-data">
                <div class="casual-label">Fecha</div>
                <div class="casual-value">{{eventDate}}</div>
              </div>
            </div>
            
            <div class="casual-info">
              <div class="casual-emoji">📍</div>
              <div class="casual-data">
                <div class="casual-label">Lugar</div>
                <div class="casual-value">{{eventLocation}}</div>
              </div>
            </div>
            
          </div>
          <div class="casual-qr">
            {{qrImage}}
          </div>
        </div>
      </div>
      {{rsvpButtons}}
    `,
    cssContent: `
      .invitation-container.casual {
        max-width: 600px;
        margin: 0 auto;
        background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
        padding: 45px 40px;
        border-radius: 30px;
        box-shadow: 0 20px 60px rgba(236,72,153,0.25);
      }
      .casual .casual-header {
        text-align: center;
        margin-bottom: 30px;
      }
      .casual h1 {
        font-size: 44px;
        font-weight: 800;
        color: #ec4899;
        margin: 0;
        letter-spacing: -1px;
      }
      .casual .casual-main {
        background: white;
        padding: 40px;
        border-radius: 25px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      }
      .casual .casual-hi {
        font-size: 22px;
        color: #ec4899;
        font-weight: 700;
        margin-bottom: 12px;
        text-align: center;
      }
      .casual .casual-text {
        font-size: 16px;
        color: #4b5563;
        text-align: center;
        margin-bottom: 30px;
      }
      .casual .casual-info-box {
        background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
        padding: 30px;
        border-radius: 20px;
        margin: 30px 0;
        border: 2px dashed #f9a8d4;
      }
      .casual .casual-info {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 22px;
      }
      .casual .casual-info:last-child {
        margin-bottom: 0;
      }
      .casual .casual-emoji {
        font-size: 36px;
        line-height: 1;
      }
      .casual .casual-data {
        flex: 1;
      }
      .casual .casual-label {
        display: block;
        font-size: 11px;
        color: #ec4899;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 5px;
        font-weight: 700;
      }
      .casual .casual-value {
        display: block;
        font-size: 19px;
        color: #1f2937;
        font-weight: 600;
      }
      .casual .casual-qr {
        text-align: center;
        margin-top: 30px;
        padding: 25px;
        background: #fdf2f8;
        border-radius: 18px;
      }
    `,
  },
];

// Helper para obtener plantilla por ID
export function getTemplatePreset(id: string): TemplatePreset | undefined {
  return TEMPLATE_PRESETS.find((preset) => preset.id === id);
}

// Helper para reemplazar placeholders en HTML
export function replaceTemplatePlaceholders(
  html: string,
  data: {
    name: string;
    eventName: string;
    eventDate: string;
    eventLocation?: string;
  }
): string {
  let result = html;
  result = result.replace(/\{\{name\}\}/g, data.name);
  result = result.replace(/\{\{eventName\}\}/g, data.eventName);
  result = result.replace(/\{\{eventDate\}\}/g, data.eventDate);
  result = result.replace(/\{\{eventLocation\}\}/g, data.eventLocation || "");
  
  // Remover bloques condicionales si no hay eventLocation
  if (!data.eventLocation) {
    result = result.replace(/\{\{#if eventLocation\}\}[\s\S]*?\{\{\/if\}\}/g, "");
  } else {
    result = result.replace(/\{\{#if eventLocation\}\}/g, "");
    result = result.replace(/\{\{\/if\}\}/g, "");
  }
  
  return result;
}
