import './common/utcYear-e8da0d00.js';
import { u as utcFormat, a as utcParse } from './common/defaultLocale-4a49c9cd.js';
export { t as timeFormat, d as timeFormatDefaultLocale, f as timeFormatLocale, b as timeParse, u as utcFormat, a as utcParse } from './common/defaultLocale-4a49c9cd.js';

var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

function formatIsoNative(date) {
  return date.toISOString();
}

var formatIso = Date.prototype.toISOString
    ? formatIsoNative
    : utcFormat(isoSpecifier);

function parseIsoNative(string) {
  var date = new Date(string);
  return isNaN(date) ? null : date;
}

var parseIso = +new Date("2000-01-01T00:00:00.000Z")
    ? parseIsoNative
    : utcParse(isoSpecifier);

export { formatIso as isoFormat, parseIso as isoParse };
