// Strip non-HTML headers from response.
// See https://dev.to/philw_/using-a-netlify-edge-worker-to-cut-down-on-header-bloat-by-removing-html-only-headers-from-your-static-assets-3nh9
export default async (request, context) => {
    const response = await context.next();

    const contentType = response.headers.get('content-type');
    if (!contentType || contentType.startsWith('text/html')) {
      return response;
    }

    const htmlOnlyHeaders = [
      'x-xss-protection',
      'x-frame-options',
      // https://webhint.io/docs/user-guide/hints/hint-no-html-only-headers
    ];

    // Loop over the headers of our response…
    response.headers.forEach((value, key, object) => {
      if (contentType.startsWith('text/javascript') && (key === 'content-security-policy' || key === 'x-content-security-policy')) {
        // In case of a JavaScript file, Content-Security-Policy and X-Content-Security-Policy
        // can be ignored since CSP is also relevant to workers.
        return;
      }

      // Otherwise, we delete any headers from the object that
      // contains them within the response.
      if (htmlOnlyHeaders.includes(key)) {
        object.delete(key);
      }
    });

    return response;
  };
