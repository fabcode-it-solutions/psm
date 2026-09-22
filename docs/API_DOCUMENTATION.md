# API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Metafields API](#metafields-api)
3. [Parts API](#parts-api)
4. [Car Management API](#car-management-api)
5. [User API](#user-api)
6. [Media API](#media-api)
7. [Search API](#search-api)
8. [Security API](#security-api)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Authentication

All API requests (except public endpoints) require authentication via NextAuth.js session cookies or API key.

### Headers Required

```http
# For Session-based (Browser)
Cookie: next-auth.session-token=<token>

# For API Key (External Apps)
Authorization: Bearer <api-key>

# For CSRF Protection (POST/PUT/DELETE)
X-CSRF-Token: <token>
```

### Get CSRF Token

```http
GET /api/security/csrf
```

**Response**:
```json
{
  "csrfToken": "abc123xyz..."
}
```

**Usage**: Include this token in `X-CSRF-Token` header for all state-changing requests.

---

## Metafields API

Dynamic custom fields system for extending entities (parts, users, builds, etc.).

### 1. Get Metafield Definitions

Retrieve all custom field definitions for an entity type.

```http
GET /api/metafields/definitions?entityType=part&namespace=custom
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | string | Yes | Entity type: `part`, `user`, `build`, `category` |
| `namespace` | string | No | Group definitions by namespace (default: `custom`) |
| `categoryId` | number | No | Filter fields for specific category |
| `includeGlobal` | boolean | No | Include global fields (default: `true`) |
| `isActive` | boolean | No | Filter by active status |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "entityType": "part",
      "namespace": "custom",
      "key": "material_type",
      "name": "Material Type",
      "description": "The material used to manufacture the part",
      "type": "select",
      "isRequired": true,
      "options": ["Aluminum", "Steel", "Carbon Fiber", "Plastic"],
      "validationRules": {
        "allowedValues": ["Aluminum", "Steel", "Carbon Fiber", "Plastic"]
      },
      "helpText": "Select the primary material",
      "placeholder": "Choose a material",
      "defaultValue": "Steel",
      "displayOrder": 1,
      "isActive": true,
      "appliesGlobally": false,
      "categoryIds": [1, 2, 3],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Create Metafield Definition

Create a new custom field definition.

```http
POST /api/metafields/definitions
```

**Headers**:
```http
Content-Type: application/json
X-CSRF-Token: <token>
```

**Request Body**:
```json
{
  "entityType": "part",
  "namespace": "custom",
  "key": "warranty_period",
  "name": "Warranty Period",
  "description": "Warranty duration in months",
  "type": "number",
  "isRequired": false,
  "validationRules": {
    "min": 1,
    "max": 120
  },
  "helpText": "Enter warranty duration (1-120 months)",
  "placeholder": "12",
  "defaultValue": "12",
  "displayOrder": 5,
  "isActive": true,
  "appliesGlobally": true,
  "categoryIds": []
}
```

**Field Types**:
| Type | Value Storage | Validation |
|------|---------------|------------|
| `text` | `valueText` | maxLength |
| `number` | `valueNumber` | min, max |
| `integer` | `valueInteger` | min, max |
| `boolean` | `valueBoolean` | - |
| `date` | `valueDate` | dateFormat |
| `datetime` | `valueDate` | dateFormat |
| `select` | `selectedOptions` | allowedValues |
| `multiselect` | `selectedOptions` | allowedValues |
| `color` | `valueText` | hexColor |
| `email` | `valueText` | emailFormat |
| `url` | `valueText` | urlFormat |
| `phone` | `valueText` | phoneFormat |
| `rich_text` | `valueText` | maxLength |
| `file` | `valueText` | allowedTypes, maxSize |

**Response**:
```json
{
  "success": true,
  "message": "Metafield definition created successfully",
  "data": {
    "id": 5,
    "entityType": "part",
    "key": "warranty_period",
    "name": "Warranty Period",
    ...
  }
}
```

### 3. Update Metafield Definition

```http
PUT /api/metafields/definitions
```

**Request Body**:
```json
{
  "id": 5,
  "name": "Warranty Duration (Months)",
  "isRequired": true,
  "defaultValue": "24"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Metafield definition updated successfully",
  "data": { ... }
}
```

### 4. Delete Metafield Definition

```http
DELETE /api/metafields/definitions/5
```

**Response**:
```json
{
  "success": true,
  "message": "Metafield definition deleted successfully"
}
```

### 5. Get Metafield Values

Retrieve custom field values for a specific entity.

```http
GET /api/metafields/values?entityType=part&entityId=123
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | string | Yes | Entity type |
| `entityId` | number | Yes | Entity ID |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "definition": {
        "id": 1,
        "key": "material_type",
        "name": "Material Type",
        "type": "select"
      },
      "value": "Aluminum"
    },
    {
      "id": 2,
      "definition": {
        "id": 5,
        "key": "warranty_period",
        "name": "Warranty Period",
        "type": "number"
      },
      "value": 24
    }
  ]
}
```

### 6. Create/Update Metafield Values

```http
POST /api/metafields/values
```

**Request Body**:
```json
{
  "entityType": "part",
  "entityId": 123,
  "metafieldDefinitionId": 1,
  "value": "Carbon Fiber"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Metafield value saved successfully",
  "data": {
    "id": 1,
    "entityType": "part",
    "entityId": 123,
    "metafieldDefinitionId": 1,
    "valueText": "Carbon Fiber",
    ...
  }
}
```

### 7. Bulk Create/Update Values

```http
PUT /api/metafields/values
```

**Request Body**:
```json
{
  "entityType": "part",
  "entityId": 123,
  "values": [
    {
      "metafieldDefinitionId": 1,
      "value": "Aluminum"
    },
    {
      "metafieldDefinitionId": 5,
      "value": 36
    },
    {
      "metafieldDefinitionId": 8,
      "value": true
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "3 metafield values updated successfully",
  "data": {
    "created": 2,
    "updated": 1,
    "values": [ ... ]
  }
}
```

---

## 🔧 Parts API

Manage automotive parts inventory.

### 1. List Parts

```http
GET /api/parts?page=1&limit=20&search=brake&status=active&sortBy=createdAt&sortOrder=desc
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |
| `search` | string | - | Search in title, SKU, description |
| `status` | string | - | Filter: `active`, `inactive`, `draft` |
| `categoryId` | number | - | Filter by category |
| `brandId` | number | - | Filter by car brand |
| `minPrice` | number | - | Minimum price |
| `maxPrice` | number | - | Maximum price |
| `inStock` | boolean | - | Filter available items |
| `sortBy` | string | createdAt | Sort field: `title`, `price`, `createdAt`, `demandScore` |
| `sortOrder` | string | desc | `asc` or `desc` |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Brake Pad Set - Front",
      "slug": "brake-pad-set-front",
      "description": "High-performance ceramic brake pads",
      "sku": "BP-FRONT-001",
      "price": "89.99",
      "compareAtPrice": "129.99",
      "quantity": 50,
      "status": "active",
      "demandScore": 85,
      "brand": {
        "id": 1,
        "name": "Toyota"
      },
      "categories": [
        {
          "id": 1,
          "name": "Brakes"
        }
      ],
      "media": [
        {
          "id": 1,
          "url": "https://cdn.example.com/brake-pad.jpg",
          "type": "image"
        }
      ],
      "variants": [
        {
          "id": 1,
          "title": "Standard",
          "sku": "BP-FRONT-001-STD",
          "price": "89.99",
          "quantity": 50
        }
      ],
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 2. Get Single Part

```http
GET /api/parts/123
```

**Response**: Same as list item + additional details:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Brake Pad Set - Front",
    ...
    "specifications": {
      "weight": "2.5",
      "weightUnit": "kg",
      "dimensions": "10x5x3 cm"
    },
    "shipping": {
      "requiresShipping": true,
      "shippingProfileId": 1
    },
    "metafields": [
      {
        "key": "material_type",
        "name": "Material Type",
        "value": "Ceramic"
      }
    ]
  }
}
```

### 3. Create Part

```http
POST /api/parts
```

**Request Body**:
```json
{
  "title": "Oil Filter - Premium",
  "description": "High-quality oil filter for Toyota engines",
  "sku": "OF-PREM-001",
  "price": 15.99,
  "compareAtPrice": 24.99,
  "quantity": 200,
  "status": "active",
  "categoryIds": [2],
  "brandId": 1,
  "modelId": 5,
  "typeId": 10,
  "weight": 0.5,
  "weightUnit": "kg",
  "requiresShipping": true,
  "taxable": true,
  "mediaIds": [5, 6],
  "variants": [
    {
      "title": "Standard",
      "sku": "OF-PREM-001-STD",
      "price": 15.99,
      "quantity": 200
    },
    {
      "title": "Heavy Duty",
      "sku": "OF-PREM-001-HD",
      "price": 22.99,
      "quantity": 100
    }
  ],
  "metafields": [
    {
      "metafieldDefinitionId": 1,
      "value": "Steel"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Part created successfully",
  "data": {
    "id": 124,
    "title": "Oil Filter - Premium",
    "slug": "oil-filter-premium",
    ...
  }
}
```

### 4. Update Part

```http
PUT /api/parts/124
```

**Request Body**: Same as create (partial updates allowed)

**Response**:
```json
{
  "success": true,
  "message": "Part updated successfully",
  "data": { ... }
}
```

### 5. Delete Part

```http
DELETE /api/parts/124
```

**Response**:
```json
{
  "success": true,
  "message": "Part deleted successfully"
}
```

---

## 🚗 Car Management API

### 1. List Brands

```http
GET /api/admin/cars/brands?page=1&limit=20&search=toyota&sortBy=name&includeBuilds=true
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `search` | string | - | Search brand name |
| `sortBy` | string | name | `name`, `createdAt`, `status` |
| `sortOrder` | string | asc | `asc` or `desc` |
| `includeBuilds` | boolean | false | Include build count |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Toyota",
      "description": "Japanese automotive manufacturer",
      "logo": {
        "id": 1,
        "url": "https://cdn.example.com/toyota-logo.png"
      },
      "image": {
        "id": 2,
        "url": "https://cdn.example.com/toyota-banner.jpg"
      },
      "status": "active",
      "builds": [],
      "_count": {
        "builds": 150
      },
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 2. Create Brand

```http
POST /api/admin/cars/brands
```

**Request Body**:
```json
{
  "name": "Tesla",
  "description": "American electric vehicle manufacturer",
  "logoMediaId": 10,
  "imageMediaId": 11,
  "status": "active"
}
```

### 3. List Models

```http
GET /api/admin/cars/models?brandId=1&page=1&limit=20
```

**Query Parameters**: Same as brands + `brandId` filter

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Camry",
      "brandId": 1,
      "brandName": "Toyota",
      "image": { ... },
      "status": "active",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### 4. List Types (Model Variants)

```http
GET /api/admin/cars/types?modelId=1&page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "2024 SE",
      "modelId": 1,
      "modelName": "Camry",
      "status": "active",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## 👤 User API

### 1. Get Current User

```http
GET /api/user
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isVerified": true,
    "profileImage": "https://cdn.example.com/profile.jpg",
    "bio": "Car enthusiast",
    "address": {
      "addressLine1": "123 Main St",
      "city": "Sydney",
      "state": "NSW",
      "postalCode": "2000",
      "country": "Australia"
    },
    "socialMedia": [
      {
        "platform": "instagram",
        "url": "https://instagram.com/johndoe"
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### 2. Update User Profile

```http
PUT /api/user
```

**Request Body** (all fields optional):
```json
{
  "id": 1,
  "updates": {
    "firstName": "John",
    "lastName": "Smith",
    "username": "john_smith",
    "bio": "Updated bio",
    "profileImage": "https://cdn.example.com/new-profile.jpg",
    "address": {
      "addressLine1": "456 New St",
      "city": "Melbourne",
      "state": "VIC",
      "postalCode": "3000"
    }
  }
}
```

**Note**: `id`, `email`, `password`, `createdAt` are restricted and will be ignored.

**Response**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": { ... }
}
```

---

## 📷 Media API

### 1. List Media

```http
GET /api/media?page=1&limit=48&search=brake&type=image&dateRange=last_30_days
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 48 | Items per page (max: 100) |
| `search` | string | - | Search filename or alt text |
| `type` | string | - | Filter: `image`, `video`, `document` |
| `dateRange` | string | - | `today`, `last_7_days`, `last_30_days`, `last_90_days` |
| `isUsed` | boolean | - | Filter by usage status |
| `sortBy` | string | createdAt | `createdAt`, `updatedAt`, `size` |
| `sortOrder` | string | desc | `asc` or `desc` |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "url": "https://cdn.example.com/brake-pad.jpg",
      "filename": "brake-pad.jpg",
      "type": "image",
      "size": 245600,
      "mimeType": "image/jpeg",
      "altText": "Front brake pad for Toyota Camry",
      "isUsed": true,
      "userId": 1,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 48,
    "total": 500,
    "totalPages": 11
  },
  "counts": {
    "images": 300,
    "videos": 50,
    "documents": 150
  }
}
```

### 2. Upload Media

```http
POST /api/media/upload
Content-Type: multipart/form-data
```

**Form Data**:
```
files: [File, File, ...] (max 10 files)
altText: "Description for accessibility"
```

**Response**:
```json
{
  "success": true,
  "message": "10 files uploaded successfully",
  "data": [
    {
      "id": 50,
      "url": "https://cdn.example.com/new-image.jpg",
      "filename": "new-image.jpg",
      "type": "image",
      "size": 123456
    }
  ]
}
```

### 3. Delete Media

```http
DELETE /api/media/1
```

**Response**:
```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

### 4. Bulk Operations

```http
POST /api/media/bulk
```

**Request Body**:
```json
{
  "operation": "delete",  // or "archive", "restore"
  "mediaIds": [1, 2, 3, 4, 5]
}
```

**Response**:
```json
{
  "success": true,
  "message": "5 media items deleted successfully"
}
```

---

## 🔍 Search API

### Universal Search

```http
GET /api/search/universe?q=brake+pad
```

**Response**:
```json
{
  "success": true,
  "query": "brake pad",
  "results": {
    "actions": [
      {
        "id": "action-add-part",
        "title": "Add New Part",
        "category": "actions",
        "route": "/dashboard/parts/new",
        "icon": "plus"
      }
    ],
    "pages": [
      {
        "id": "page-parts",
        "title": "Parts Management",
        "category": "pages",
        "route": "/dashboard/parts",
        "icon": "package"
      }
    ],
    "parts": [
      {
        "id": 1,
        "title": "Brake Pad Set - Front",
        "category": "parts",
        "route": "/parts/1",
        "price": 89.99,
        "image": "https://cdn.example.com/brake-pad.jpg"
      }
    ],
    "categories": [],
    "brands": [],
    "models": [],
    "users": [],
    "metafields": []
  },
  "totalResults": 15
}
```

---

## 🔒 Security API

### 1. Get CSRF Token

```http
GET /api/security/csrf
```

**Response**:
```json
{
  "csrfToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Health Check

```http
GET /api/security/health
```

**Response**:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "responseTime": 5,
    "poolStatus": {
      "totalConnections": 2,
      "idleConnections": 1,
      "activeConnections": 1,
      "waitingRequests": 0
    }
  },
  "timestamp": "2025-01-18T12:00:00Z"
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "details": {
    "field": "username",
    "issue": "Username already exists"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CSRF_ERROR` | 403 | CSRF token invalid/missing |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Validation Errors

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "price",
      "message": "Price must be greater than 0"
    }
  ]
}
```

---

## 🚦 Rate Limiting

Rate limits are applied per IP address and per user (if authenticated).

### Limits

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/api/auth/*` | 5 requests | 1 minute |
| `/api/parts` (POST/PUT/DELETE) | 60 requests | 1 minute |
| `/api/metafields/*` | 100 requests | 1 minute |
| `/api/search/*` | 30 requests | 1 minute |
| `/api/media/upload` | 10 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642510800
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## 📝 Best Practices

### 1. Always Include CSRF Token

For all POST/PUT/DELETE requests:
```javascript
const response = await fetch('/api/parts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

### 2. Handle Errors Gracefully

```javascript
try {
  const response = await fetch('/api/parts/123');
  const data = await response.json();
  
  if (!data.success) {
    console.error('API Error:', data.error);
    // Handle specific error codes
    if (data.code === 'UNAUTHORIZED') {
      // Redirect to login
    }
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

### 3. Use Pagination

Always paginate list endpoints:
```javascript
const fetchParts = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/parts?page=${page}&limit=${limit}`);
  return response.json();
};
```

### 4. Implement Debounce for Search

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  const response = await fetch(`/api/search/universe?q=${query}`);
  const data = await response.json();
  setResults(data.results);
}, 500);
```

### 5. Cache CSRF Tokens

```javascript
let csrfToken = null;

async function getCSRFToken() {
  if (!csrfToken) {
    const response = await fetch('/api/security/csrf');
    const data = await response.json();
    csrfToken = data.csrfToken;
  }
  return csrfToken;
}
```

---

## 🔗 Related Documentation

- **README.md**: Project overview and setup
- **SECURITY_DOCUMENTATION.md**: Security implementation details

