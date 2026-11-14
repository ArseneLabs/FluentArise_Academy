/**
 * Utility script to register a new IPN URL on Pesapal.
 * Usage:
 *   node scripts/register-ipn.mjs https://yourdomain.com/api/pesapal/ipn
 */
import { getPesapalToken } from '../api/_pesapal.js';

const targetUrl = process.argv[2] || 'https://fluentarise.com/api/pesapal/ipn';
const consumerKey = process.env.PESAPAL_CONSUMER_KEY || 'hr51kH3NOZxXdaZbCIvv80iThvrJfqJM';
const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || 'PFiCnB/iXtJzH4EwbLtjDUeZyqg=';

async function register() {
  console.log(`Registering IPN URL: ${targetUrl}...`);

  const tokenRes = await fetch('https://pay.pesapal.com/v3/api/Auth/RequestToken', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.token) {
    console.error('Failed to get token:', tokenData);
    process.exit(1);
  }

  const res = await fetch('https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenData.token}`,
    },
    body: JSON.stringify({
      url: targetUrl,
      ipn_notification_type: 'GET',
    }),
  });

  const data = await res.json();
  console.log('Pesapal IPN Registration Result:');
  console.log(JSON.stringify(data, null, 2));

  if (data.ipn_id) {
    console.log(`\nSUCCESS! Add this to your environment variables:\nPESAPAL_IPN_ID=${data.ipn_id}`);
  }
}

register().catch(console.error);
