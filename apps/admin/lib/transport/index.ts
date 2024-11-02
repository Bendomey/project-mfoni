import { auth } from '../cookies.config';
import { API_ADDRESS, USER_CIPHER } from '@/constants/misc';

/**
 * Fetch wrapper to treat 4xx - 5xx status codes as errors.
 * We should be able to access those error messages in our catch block!
 *
 * @returns {Promise} - Returns promise.
 */
function transport(input: RequestInfo, init?: RequestInit): Promise<Response> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(input, init);
      if (!response.ok) {
        reject(response);
      }
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
}

interface FetchClientConfig extends RequestInit {
  /**
   * If not set, defaults to the staff api address {API_ADDRESS}.
   */
  baseUrl?: string;
  /**
   * Most of our requests will be made with a token.
   * So to make sure we don't set this everytime(ux reasons), I'm rather
   * checking for unauthorized requests.
   *
   * @example - If request is an unauthorized request, we don't append the Authorization header.
   * fetchClient('path-here', {isUnAuthorized:true})
   *
   * @example If request needs authorization, we append the Authorization header here.
   * fetchClient('path-here')
   */
  isUnAuthorizedRequest?: boolean;
}

interface HttpResponse<T> extends Response {
  parsedBody: T;
}

/**
 * Fetch client returns actual data/error.
 *
 * @returns {Promise} - Returns promise.
 */
export function fetchClient<T>(
  path: string,
  config?: FetchClientConfig
): Promise<HttpResponse<T>> {
  return new Promise(async (resolve, reject) => {
    const baseUrl = config?.baseUrl ?? API_ADDRESS; // Defaults to ADMIN's api address.

    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...config?.headers,
    });

    try {
      if (!config?.isUnAuthorizedRequest) {
        let userToken: { token: string; username: string } | undefined =
        auth.getCipher(USER_CIPHER);
        if (userToken) {
          headers.append('Authorization', `Bearer ${userToken?.token}`);
        }
      }

      const response = await transport(`${baseUrl}${path}`, {
        ...config,
        headers,
      });

      const contentType = response.headers.get('Content-Type');

      let parsedBody;
      if (contentType && contentType.indexOf('json') > -1) {
        parsedBody = await response.json();
      } else {
        parsedBody = await response.text();
      }

      const res: HttpResponse<T> = {
        ...response,
        parsedBody,
      };

      resolve(res);
    } catch (error) {
      reject(error);
    }
  });
}
