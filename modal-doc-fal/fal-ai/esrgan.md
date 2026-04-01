# Upscale Images

> Upscale images by a given factor.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/esrgan`
- **Model ID**: `fal-ai/esrgan`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: upscaling, high-res



## Pricing

Your request will cost **$0.00111** per compute second

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  Url to input image
  - Examples: "https://storage.googleapis.com/falserverless/model_tests/remove_background/elephant.jpg", "https://storage.googleapis.com/falserverless/gallery/blue-bird.jpeg", "https://storage.googleapis.com/falserverless/model_tests/upscale/image%20(8).png"

- **`scale`** (`float`, _optional_):
  Rescaling factor Default value: `2`
  - Default: `2`
  - Range: `1` to `8`

- **`tile`** (`integer`, _optional_):
  Tile size. Default is 0, that is no tile. When encountering the out-of-GPU-memory issue, please specify it, e.g., 400 or 200
  - Default: `0`

- **`face`** (`boolean`, _optional_):
  Upscaling a face
  - Default: `false`

- **`model`** (`ModelEnum`, _optional_):
  Model to use for upscaling Default value: `"RealESRGAN_x4plus"`
  - Default: `"RealESRGAN_x4plus"`
  - Options: `"RealESRGAN_x4plus"`, `"RealESRGAN_x2plus"`, `"RealESRGAN_x4plus_anime_6B"`, `"RealESRGAN_x4_v3"`, `"RealESRGAN_x4_wdn_v3"`, `"RealESRGAN_x4_anime_v3"`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  Output image format (png or jpeg) Default value: `"png"`
  - Default: `"png"`
  - Options: `"png"`, `"jpeg"`



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/remove_background/elephant.jpg"
}
```

**Full Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/model_tests/remove_background/elephant.jpg",
  "scale": 2,
  "model": "RealESRGAN_x4plus",
  "output_format": "png"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`Image`, _required_):
  Upscaled image



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
  --url https://fal.run/fal-ai/esrgan \
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
    "fal-ai/esrgan",
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

const result = await fal.subscribe("fal-ai/esrgan", {
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

- [Model Playground](https://fal.ai/models/fal-ai/esrgan)
- [API Documentation](https://fal.ai/models/fal-ai/esrgan/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/esrgan)
- [GitHub Repository](https://github.com/xinntao/Real-ESRGAN/blob/master/LICENSE)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)
