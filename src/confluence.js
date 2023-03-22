/* eslint-disable no-undef */
import { formatDate, getCookie, isNonEmptyArray, genCustomConsole } from 'mazey';

const ConCon = genCustomConsole('Confluence:');

ConCon.log('loaded');

// Area: `.wiki-content`
if (window.$) {
  // Format
  $('.wiki-content>p>br').hide();
  // Table
  $('.wiki-content td.confluenceTd>a').after('<br />');
  // Record
  const userName = getCookie('username') || 'unknown';
  let pageTitle = document.title;
  if (typeof pageTitle === 'string' && pageTitle.length) {
    const titleArr = pageTitle.split('-');
    if (isNonEmptyArray(titleArr)) {
      pageTitle = titleArr[0];
    }
  }
  const settings = {
    url: 'https://i.mazey.net/server/log/add',
    method: 'POST',
    timeout: 0,
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      log_type: 'confluence',
      content: `「${userName}」visited「[${pageTitle}](${location.href})」at「${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}」`,
    }),
  };
  $.ajax(settings).done(function (response) {
    // ConCon.log(response);
  });
}
