/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for conversion.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "conversion.js",
  family: "A",
  command: "conversion",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "conversion",
  aliases: [],
  category: "restored",
  description: "Restored: conversion",
  usage: ".conversion",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
