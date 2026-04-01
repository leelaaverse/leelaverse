# Qwen Image 2

> Qwen-Image-2.0 is a next-generation foundational unified generation-and-editing model


## Overview

- **Endpoint**: `https://fal.run/fal-ai/qwen-image-2/pro/edit`
- **Model ID**: `fal-ai/qwen-image-2/pro/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: stylized, transform



## Pricing

- **Price**: $0.075 per images

For more details, see [fal.ai pricing](https://fal.ai/pricing).

## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  Text prompt describing the desired image. Supports Chinese and English;.
  - Examples: "Make this scene summer setting."

- **`negative_prompt`** (`string`, _optional_):
  Content to avoid in the generated image. Max 500 characters. Default value: `""`
  - Default: `""`
  - Examples: "low resolution, error, worst quality, low quality, deformed"

- **`image_size`** (`ImageSize | Enum`, _optional_):
  The size of the generated image. If not provided, the size of the final input image will be used.  Total number of pixels must be between 512x512 and 2048x2048.
  - One of: ImageSize | Enum

- **`enable_prompt_expansion`** (`boolean`, _optional_):
  Enable LLM prompt optimization for better results. Default value: `true`
  - Default: `true`

- **`seed`** (`integer`, _optional_):
  Random seed for reproducibility (0-2147483647).

- **`enable_safety_checker`** (`boolean`, _optional_):
  Enable content moderation for input and output. Default value: `true`
  - Default: `true`

- **`sync_mode`** (`boolean`, _optional_):
  If `True`, the media will be returned as a data URI and the output data won't be available in the request history.
  - Default: `false`

- **`num_images`** (`integer`, _optional_):
  The number of images to generate. Default value: `1`
  - Default: `1`
  - Range: `1` to `6`

- **`output_format`** (`OutputFormatEnum`, _optional_):
  The format of the generated image. Default value: `"png"`
  - Default: `"png"`
  - Options: `"jpeg"`, `"png"`, `"webp"`

- **`image_urls`** (`list<string>`, _required_):
  Reference images for editing (1-3 images required). Order matters: reference as 'image 1', 'image 2', 'image 3' in prompt. Resolution: 384-5000px each dimension. Max size: 10MB each. Formats: JPEG, JPG, PNG (no alpha), WEBP.
  - Array of string
  - Examples: ["https://v3b.fal.media/files/b/0a90b28f/45QiEHyDMwQiB3jFyZ79F_image_00079.png"]



**Required Parameters Example**:

```json
{
  "prompt": "Make this scene summer setting.",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a90b28f/45QiEHyDMwQiB3jFyZ79F_image_00079.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "Make this scene summer setting.",
  "negative_prompt": "low resolution, error, worst quality, low quality, deformed",
  "enable_prompt_expansion": true,
  "enable_safety_checker": true,
  "num_images": 1,
  "output_format": "png",
  "image_urls": [
    "https://v3b.fal.media/files/b/0a90b28f/45QiEHyDMwQiB3jFyZ79F_image_00079.png"
  ]
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<File>`, _required_):
  Generated images
  - Array of File
  - Examples: [{"url":"https://v3b.fal.media/files/b/0a90b290/axCNP0ohkN-dRzHMD4gYy_YMJTfAo2.png"}]

- **`seed`** (`integer`, _required_):
  The seed used for generation
  - Examples: 42



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://v3b.fal.media/files/b/0a90b290/axCNP0ohkN-dRzHMD4gYy_YMJTfAo2.png"
    }
  ],
  "seed": 42
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/qwen-image-2/pro/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Make this scene summer setting.",
     "image_urls": [
       "https://v3b.fal.media/files/b/0a90b28f/45QiEHyDMwQiB3jFyZ79F_image_00079.png"
     ]
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
    "fal-ai/qwen-image-2/pro/edit",
    arguments={
        "prompt": "Make this scene summer setting.",
        "image_urls": ["https://v3b.fal.media/files/b/0a90b28f/45QiEHyDMwQiB3jFyZ79F_image_00079.png"]
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

const result = await fal.subscribe("fal-ai/qwen-image-2/pro/edit", {
  input: {
    prompt: "Make this scene summer setting.",
    image_urls: ["https://v3b.fal.media/files/b/0a90b28f/45QiEHyDMwQiB3jFyZ79F_image_00079.png"]
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

- [Model Playground](https://fal.ai/models/fal-ai/qwen-image-2/pro/edit)
- [API Documentation](https://fal.ai/models/fal-ai/qwen-image-2/pro/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/qwen-image-2/pro/edit)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)
