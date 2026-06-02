function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, status, message, errors) {
  const payload = { success: false, message };
  if (errors && errors.length) payload.errors = errors;
  return res.status(status).json(payload);
}

module.exports = { ok, fail };

