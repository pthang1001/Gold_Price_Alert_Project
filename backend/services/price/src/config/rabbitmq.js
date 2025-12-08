const amqp = require('amqplib');
const { logger } = require('./logger');

let channel;
let connection;

const connectRabbitMQ = async () => {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost';
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    
    logger.info('✅ Connected to RabbitMQ');
    
    return channel;
  } catch (error) {
    logger.error('❌ RabbitMQ connection error:', error);
    // Retry after 5 seconds
    setTimeout(connectRabbitMQ, 5000);
  }
};

const publishEvent = async (exchangeName, routingKey, message) => {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }
    
    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    logger.info(`📤 Event published: ${routingKey}`, message);
  } catch (error) {
    logger.error('❌ Failed to publish event:', error);
  }
};

module.exports = {
  connectRabbitMQ,
  publishEvent,
  getChannel: () => channel
};
