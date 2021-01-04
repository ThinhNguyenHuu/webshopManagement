const { google } = require('googleapis');
google.options({ timeout: 5000 });
const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
const private_key = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCgBJObR95Qng37\nNlZOkC6Rt3/tl3zc4hVvgv7Wx+pK06TNcf6YSXKqPlgo3O6/wMEXFefgoiKlZdX/\nk9l5YHS6Qj9F+Cs1rpo/qG0fJRXh0iif+MOb1zgBbmq2MuPKV8q1ok7Io9R1Vs7I\n7DkbiaII/XGh+tPlIAyVBF1AemaCqC3oRCITOYPjqU2MB/Hpn+uwYUb+nUr03YDA\nW2Bnvaog5EW3adjrXjgrWgTfzt+iX84m6KcP2PB05NC7FPjYMtua0M+D/md5MFbV\nyxuFpgeU/cJi5wOGUDiOUmLxhrFjkfoanQzuCFIqfZ7XzICLH2f9x0PxlVRdCvGs\nCq9vhVLVAgMBAAECggEACad9CFdTsGV4znk+x8qnJJ9/lmQXYnQ5etraaTbyicUv\nIj4IcEOuKVtNklmSBfupKq1lqgXeNUBpotvWuR36rOomSyBn6vs3zzNoMgLYySEW\n1l/53UMk2+E/ivKTD7gwQLkkK7LGtLWiEDlAUMsC/avc2Tr64c4HNE5pGeTInoVS\nhk3odoErerfAfek3upsqpsu8SLZP3gGPCSz37kWwFNKzLKctrtYOifE5uY6c+cXf\ngFd3kdWr10odQ7ZpVRnlyo+t0bqyIn0n2D9bP4fpI39Af9w3HipmpBDzZeJ3Y0ce\ni0wpOBBXT+ZZouqWiBWVP99LU4aYXUon0IIo7H47WQKBgQDe8jKmRB8YEbQf3m6y\nrXHHIaoPlsvDSeHxcmThKcVCXRZflrXwfr0/7W6LTvPX4f5gZjvbAxCVbU7Z5iHT\n4ewO8FwEWRcfZw39gd4yHlIhk4WuJqIs9I1p9tvRh2PN6N4bRtnUuLHrd2wIfhcP\ntvsG6klm5fMGpDW1xB7IrRk9ZwKBgQC3vfizl5N+mnTn58IPNL3LV4c8TBG4E4R9\n58uxqZm50/CaKNZ1si5pi3/C732BL/H8TmcjPcdXNlWSfS1YygqHfStZQWa1J0lu\n3JaTPGRM28Mu1pLbVffYZw+HhPMGVBT/sME+aMXuhJqd6IVOeHTVx/bbsozx6/KO\neh3KnjhMYwKBgHwIyS8BZT8x0kGMsY+MuWktDH0ByzlJ6H84wnEWmR0zxtfFdFFp\nYYaoZMDyWu03WRtupUxSpy5LEvxdcWJ9JaSmCruMiTW6UulAEEtX3R+7ADuEWOOj\n5u0WHvOyXE9ZiAAq6dPUMYAr/5m19MSUa5JMVCwAMLX4M719cBb7XrhvAoGBAKul\nrXrgY+pGkmW+TLx10cPu7af3jCoBGamg69n5jWFay47IDah/nvn8VosdvYn85zuD\nZrg2U012tbQWelFS1UlDNka4YSFkJSaKraO4LB7cwda0nxaFlfY0OP6pxXoo/EDs\nt2n86MLsX6CagkYPI14+4q7UevTZLYvKKqCI9CDvAoGBAM95qzAg8SIW8sjogom6\nA7Es5OkwwS3D+tDRUHcn1p6Lwcb7rpPNsin1cPYcaz7/IUbC9GQNxoZuK0qE6uLF\nFeGILvfrxKP25nMBenEsRl7k0CJ6oOx+GN3xPphZu/GAvKVr0w9aF3rXPV95RUii\n5PI1LY6W5ouGt6UC28UjsKCZ\n-----END PRIVATE KEY-----\n';
const jwt = new google.auth.JWT(process.env.ANALYTICS_CLIENT_EMAIL, null, private_key, scopes);
const viewId = process.env.ANALYTICS_VIEW_ID;


module.exports.getOnlineUser = async () => {
  const response = await jwt.authorize();
  const result = await google.analytics('v3').data.realtime.get({
    'auth': jwt,
    'ids': 'ga:' + viewId,
    'metrics': 'rt:activeUsers',
    'dimensions': 'ga:medium'
  });

  if (!result || !result.data.rows)
    return 0;
  return parseInt(result.data.rows[0][1]);
}

module.exports.getUserAccessData = async () => {
  const response = await jwt.authorize();
  const result = await google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + viewId,
    'start-date': '6daysAgo',
    'end-date': 'today',
    'metrics': 'ga:users',
    'dimensions': 'ga:date'
  });

  if (!result)
    return { dates: [], counts: [] };

  const data = result.data.rows;
  const dates = [];
  const counts = [];

  data.forEach(item => {
    const day = item[0].substring(6, 8);
    const month = item[0].substring(4, 6);
    const year = item[0].substring(0, 4);

    const date = [day, month, year].join('/');
    dates.push(date);
    counts.push(parseInt(item[1]));
  });

  return { dates, counts };
}

module.exports.getTopSearchQueryData = async () => {
  const response = await jwt.authorize();
  const result = await google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + viewId,
    'start-date': '30daysAgo',
    'end-date': 'today',
    'metrics': 'ga:searchResultViews',
    'dimensions': 'ga:searchKeyword',
    'sort': '-ga:searchResultViews',
    'max-results': 7
  });

  if (!result)
    return { keywords: [], counts: [] };

  const data = result.data.rows;
  const keywords = [];
  const counts = [];
  data.forEach(item => {
    keywords.push(item[0]);
    counts.push(parseInt(item[1]));
  });

  return { keywords, counts };
}

module.exports.getUserLocationData = async () => {
  const response = await jwt.authorize();
  const result = await google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + viewId,
    'start-date': '30daysAgo',
    'end-date': 'today',
    'metrics': 'ga:users',
    'dimensions': 'ga:city',
    'max-results': 5
  });

  if (!result)
    return { locations: [], counts: [] };

  const data = result.data.rows;
  const locations = [];
  const counts = [];
  data.forEach(item => {
    locations.push(item[0]);
    counts.push(parseInt(item[1]));
  });

  return { locations, counts };
}

