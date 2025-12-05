const amqp = require('amqplib');

let channel = null;

const connect = async () => {
  try {
    const connection = await amqp.connect(process.env.AMQP_URL || 'amqp://rabbitmq:5672');
    channel = await connection.createChannel();
    console.log('✅ RabbitMQ connected');
    return channel;
  } catch (err) {
    console.error('❌ RabbitMQ connection failed:', err.message);
    setTimeout(connect, 5000);
  }
};

const getChannel = () => channel;

const publish = async (exchange, routingKey, message) => {
  if (!channel) await connect();
  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
};

const consume = async (queue, callback) => {
  if (!channel) await connect();
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, callback, { noAck: false });
};

module.exports = { connect, getChannel, publish, consume };
