# Remove Background

> Remove the background from an image.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/imageutils/rembg`
- **Model ID**: `fal-ai/imageutils/rembg`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: background removal, utility, editing



## Pricing

- **Price**: $0 per compute seconds

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  Input image url.
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/remove_background/elephant.jpg"

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`crop_to_bbox`** (`boolean`, _optional_):
  If set to true, the resulting image be cropped to a bounding box around the subject
  - Default: `false`



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/remove_background/elephant.jpg"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  Background removed image.



**Example Response**:

```json
{
  "image": {
    "url": "",
    "content_type": "image/png",
    "file_name": "z9RV14K95DvU.png",
    "file_size": 4404019,
    "width": 1024,
    "height": 1024
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/imageutils/rembg \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/model_tests/remove_background/elephant.jpg"
   }'
```

### Python

Ensure you have the Python client installed:

```bash
pip install fal-client
```

Then use the API client to make requests:

```python
import fal_client

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
           print(log["message"])

result = fal_client.subscribe(
    "fal-ai/imageutils/rembg",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/model_tests/remove_background/elephant.jpg"
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
print(result)
```

### JavaScript

Ensure you have the JavaScript client installed:

```bash
npm install --save @fal-ai/client
```

Then use the API client to make requests:

```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/imageutils/rembg", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/model_tests/remove_background/elephant.jpg"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data);
console.log(result.requestId);
```


## Additional Resources

### Documentation

- [Model Playground](https://fal.ai/models/fal-ai/imageutils/rembg)
- [API Documentation](https://fal.ai/models/fal-ai/imageutils/rembg/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/imageutils/rembg)
- [GitHub Repository](https://github.com/danielgatis/rembg/blob/main/LICENSE.txt)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)
