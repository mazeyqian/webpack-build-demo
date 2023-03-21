/* eslint-disable no-undef */
import { formatDate, getCookie } from 'mazey';

console.log('confluence');

// Area: `.wiki-content`
if (window.$) {
  // Format
  $('.wiki-content>p>br').hide();
  // Table
  $('.wiki-content td.confluenceTd>a').after('<br />');
  // Record
  const userName = getCookie('username') || 'unknown';
  const settings = {
    url: 'https://i.mazey.net/server/log/add',
    method: 'POST',
    timeout: 0,
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      log_type: 'confluence',
      content: `「${userName}」visited「[${document.title}](${location.href})」at「${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}」`,
    }),
  };
  $.ajax(settings).done(function (response) {
    // console.log(response);
  });
}
