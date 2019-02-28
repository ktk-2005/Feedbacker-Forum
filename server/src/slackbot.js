import request from 'request'

// TODO: Is link only path and complete link should be constructed here?
export async function newFeedbackerNotification(link) {
  // TODO: Get webhook url from slack api
  const webhookURL = process.env.webhook
  await request({
    url: webhookURL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // TODO: What should the message be?
      text: `Check out new Feedbackable app from ${link}`,
    }),
  })
}
