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
    this.baseUrl = process.env.CASHFREE_ENVIRONMENT === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    console.log('Cashfree Environment:', process.env.CASHFREE_ENVIRONMENT);
    console.log('Cashfree App ID:', this.appId ? 'Set' : 'Not set');
    console.log('Cashfree Secret Key:', this.secretKey ? 'Set' : 'Not set');
    console.log('Cashfree Base URL:', this.baseUrl);

    if (!this.appId || !this.secretKey) {
      console.warn('Cashfree credentials not found. Payment integration may not work.');
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
      console.log('Creating Cashfree order:', orderData);

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cashfree API error:', response.status, errorText);
        throw new Error(`Cashfree API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Cashfree order created successfully:', result);

      // Generate payment URL using the payment session ID
      if (result.payment_session_id) {
        const checkoutUrl = process.env.CASHFREE_ENVIRONMENT === 'production'
          ? 'https://payments.cashfree.com/pay'
          : 'https://sandbox.cashfree.com/pg/checkout';
        result.payment_url = `${checkoutUrl}?payment_session_id=${result.payment_session_id}`;
      }

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