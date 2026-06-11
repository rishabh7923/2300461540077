const LOG_API_URL = 'http://4.224.186.213/evaluation-service/logs';
const AUTH_API_URL = 'http://4.224.186.213/evaluation-service/auth';

const STACKS = ['backend', 'frontend'];
const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const BACKEND_PACKAGES = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
const FRONTEND_PACKAGES = ['api', 'component', 'hook', 'page', 'state', 'style'];
const SHARED_PACKAGES = ['auth', 'config', 'middleware', 'utils'];

module.exports = {
    LOG_API_URL,
    AUTH_API_URL,
    STACKS,
    LEVELS,
    BACKEND_PACKAGES,
    FRONTEND_PACKAGES,
    SHARED_PACKAGES
};
