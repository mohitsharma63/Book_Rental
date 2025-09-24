interface CashfreeOrderRequest {
  order_id: string;
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  order_meta?: {
    return_url?: string;
    notify_url?: string;
  };
}

interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: string;
  payment_session_id: string;
  order_expiry_time: string;
  order_note: string;
  created_at: string;
  order_splits: any[];
}

class CashfreeService {
  private baseUrl: string;
  private appId: string;
  private secretKey: string;

  constructor() {
    this.appId = process.env.CASHFREE_APP_ID || '';
    this.secretKey = process.env.CASHFREE_SECRET_KEY || '';
    
    // Default to sandbox if environment not specified
    const environment = process.env.CASHFREE_ENVIRONMENT || 'sandbox';
    this.baseUrl = environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    console.log('Cashfree Environment:', environment);
    console.log('Cashfree App ID:', this.appId ? `${this.appId.substring(0, 8)}...` : 'Not set');
    console.log('Cashfree Secret Key:', this.secretKey ? `${this.secretKey.substring(0, 8)}...` : 'Not set');
    console.log('Cashfree Base URL:', this.baseUrl);

    if (!this.appId || !this.secretKey || this.appId === 'cashfree_app_id' || this.secretKey === 'cashfree_secret_key') {
      console.error('CRITICAL: Cashfree credentials not configured properly. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in environment variables.');
      console.error('Current App ID:', this.appId || 'undefined');
      console.error('Current Secret Key length:', this.secretKey ? this.secretKey.length : 0);
    }
  }

  private getHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Client-Id': this.appId,
      'X-Client-Secret': this.secretKey,
      'x-api-version': '2023-08-01'
    };
  }

  async createOrder(orderData: CashfreeOrderRequest): Promise<CashfreeOrderResponse & { payment_url?: string }> {
    try {
      if (!this.appId || !this.secretKey || this.appId === 'cashfree_app_id' || this.secretKey === 'cashfree_secret_key') {
        throw new Error('Cashfree credentials not configured properly. Please set valid CASHFREE_APP_ID and CASHFREE_SECRET_KEY environment variables');
      }

      console.log('Creating Cashfree order for amount:', orderData.order_amount);
      console.log('Using App ID:', this.appId.substring(0, 8) + '...');
      console.log('API URL:', `${this.baseUrl}/orders`);

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Cashfree API error:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
          url: `${this.baseUrl}/orders`,
          headers: this.getHeaders()
        });
        throw new Error(`Cashfree API error: ${response.status} - ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Cashfree response:', responseText);
        throw new Error('Invalid response from Cashfree API');
      }

      console.log('Cashfree order created successfully:', {
        order_id: result.order_id,
        cf_order_id: result.cf_order_id,
        payment_session_id: result.payment_session_id
      });

      // Validate payment session ID
      if (!result.payment_session_id) {
        console.error('Cashfree response missing payment_session_id:', result);
        throw new Error('Payment session ID not received from Cashfree');
      }

      // Generate payment URL using the payment session ID
      const environment = process.env.CASHFREE_ENVIRONMENT || 'sandbox';
      const checkoutUrl = environment === 'production'
        ? 'https://checkout.cashfree.com/pg/checkout/pay'
        : 'https://sandbox.cashfree.com/pg/checkout/pay';

      result.payment_url = `${checkoutUrl}?payment_session_id=${result.payment_session_id}`;

      console.log('Generated payment URL:', result.payment_url);

      return result;
    } catch (error) {
      console.error('Error creating Cashfree order:', error);
      throw error;
    }
  }

  async getOrderStatus(orderId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get order status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting order status:', error);
      throw error;
    }
  }

  async getPaymentStatus(orderId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}/payments`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
}

export const cashfreeService = new CashfreeService();