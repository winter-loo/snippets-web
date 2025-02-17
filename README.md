# snippets-web

This repo should include pure css/js/html snippets.

## deploy

Move this repo to /usr/share/nginx/html/ and the final path is /usr/share/nginx/html/snippets-web.

For nginx.conf, add

```
location /snippets-web {
  root /usr/share/nginx/html;
  index index.html;
}
```
