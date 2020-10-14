FROM nginx

COPY ./config/certificates/ /etc/nginx/certs/

COPY nginx.conf /etc/nginx/nginx.conf

# Copy combined config file for the app, api & static files
RUN mkdir -p /etc/nginx/conf.d/sites-available/
COPY ./app.conf /etc/nginx/conf.d/sites-available/app.conf

COPY ./config/privacy-policy.html /var/www/static/privacy-policy/privacy-policy.html

COPY ./examples/ /var/www/static/examples

# Symbolic link from sites-available to sites-enabled
RUN ln -s /etc/nginx/conf.d/sites-available /etc/nginx/conf.d/sites-enabled

EXPOSE 80 443

CMD nginx -g 'daemon off;'