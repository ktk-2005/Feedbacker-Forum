
# API

## Headers

Some API endpoints require specific headers to be set.
This allows us to conveniently pass contextual information to the server without having to append it manually to every request.

You don't need to set the headers manually in the client code: They are set automatically when using [`apiCall()`](/client/src/api-call.js).

### Instance

Instance specific endpoints like comments expect the current instance to be passed through the `X-Feedback-Host` header. This header simply contains the hostname of the current page. The API server parses the container subdomain ID from the header.

### Authentication

Authentication is done using the standard `Authorization` header with a non-standard `Feedbacker` scheme. The content of the authorization header is a base-64 encoded **user object**. As the feedback tool may generate multiple user tokens for the same user merging them later users are represented as an object of the form:

```json
{
  "public-token-1": "private-token-1",
  "public-token-2": "private-token-2"
}
```

## Version

@api /api/version

## Comments

@api /api/comments

@api /api/comments/:threadId

## Questions

@api /api/questions

## Reactions

@api /api/reactions

## Users

@api /api/users

@api /api/users/role

## Instances

@api /api/instances

@api /api/instances/new

@api /api/instances/logs/:name

@api /api/instances/start

@api /api/instances/stop

@api /api/instances/delete
