/************************************************************
************************************************************* Router class (helper) that will help with 
************************************************************* creating endpoints
*************************************************************
*/
const Method = method => req =>
    req.method.toLowerCase() === method.toLowerCase()
const Get = Method('get')
const Post = Method('post')

const Header = (header, val) => req => req.headers.get(header) === val
const Host = host => Header('host', host.toLowerCase())
const Referrer = host => Header('referrer', host.toLowerCase())

const Path = regExp => req => {
    const url = new URL(req.url)
    const path = url.pathname
    const match = path.match(regExp) || []
    return match[0] === path
}

// Main use of this class is to provide some basic methods that can be used in the handler functions
// This class is also used to create a new endpoint ('/links'  in this case)
class Router {
    constructor() {
        this.routes = []
    }

    handle(conditions, handler) {
        this.routes.push({
            conditions,
            handler,
        })
        return this
    }

    get(url, handler) {
        return this.handle([Get, Path(url)], handler)
    }

    post(url, handler) {
        return this.handle([Post, Path(url)], handler)
    }

    all(handler) {
        return this.handle([], handler)
    }

    route(req) {
        const route = this.resolve(req)

        if (route) {
            return route.handler(req)
        }
		
		// checks whether or not the specified endpoint is reachable or even exists
        return new Response("resource not found", {
            status: 404,
            statusText: 'not found',
            headers: {
                'content-type': 'text/plain',
            },
        })
    }

    resolve(req) {
        return this.routes.find(r => {
            if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
                return true
            }

            if (typeof r.conditions === 'function') {
                return r.conditions(req)
            }

            return r.conditions.every(c => c(req))
        })
    }
}

/************************************************************* end of router class
*************************************************************/


// array containing the name and url objects in the correct structure
const url_arr = [{'name': 'Rutgers University', 'url': 'https://www.rutgers.edu/'}, {'name': 'University of Michigan', 'url':'https://umich.edu/'}, {'name': 'Georgia Tech.', 'url':'https://www.gatech.edu/'}]
const projURL = 'https://static-links-page.signalnerve.workers.dev'

// Register a FetchEvent listener that sends a custom response for the given request
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

function handler(request) {
    const init = {
        headers: { 'content-type': 'application/json' },
    }
	var body = ""	
	body = JSON.stringify({ url_arr })
    return new Response(body, init)
}


async function handleRequest(request) {
	const r = new Router()
	// Replacing with the appropriate paths and handlers and returning the response from the origin
	r.get('/links', request => handler(request))
	r.get('/links', request => fetch(request)) 
	
	// Customizing HTML
	const rewriter1 = new HTMLRewriter()
	// adding links
	.on('#links', new addTag('<a href='+url_arr[0]['url']+'>'+url_arr[0]['name']+'</a>'))
	.on('#links', new addTag('<a href='+url_arr[1]['url']+'>'+url_arr[1]['name']+'</a>'))
	.on('#links', new addTag('<a href='+url_arr[2]['url']+'>'+url_arr[2]['name']+'</a>'))
	
	// making the div visible by changing the 'display' attribute
	.on('div#profile', new AttributeRewriter('style', 'display:visible'))
	.on('div#social', new AttributeRewriter('style', 'display:visible'))
	// adding socials
	.on('#social', new addTag('<a href=https://www.linkedin.com/in/himesh-buch-003b98154><svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24"><title>LinkedIn icon</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>'))
	.on('#social', new addTag('<a href=https://github.com/himesh257><svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24"><title>GitHub icon</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>'))
	// adding username and changing title
	.on('h1#name', new TextRewriter('Himesh Buch (buchhimesh@gmail.com)'))
	//.on('img#avatar', new AttributeRewriter('src', 'profile.png'))
	.on('title', new TextRewriter('Himesh Buch'))
	// changing background color
	.on('body', new AttributeRewriter('style', 'background:#b5651d'))
	
	let response = await fetch(projURL)
	
    response = new Response(response.body, response)
    response.headers.set('content-type', 'text/html')
	response.headers.set('Set-Cookie', 'SameSite=None')	

	r.get('/', () => rewriter1.transform(response))
	r.get('', () => rewriter1.transform(response))

	const resp = await r.route(request)	  
	
    return resp
	
}

// class to add an attribute or to modify an existing one
class AttributeRewriter {
  constructor(attributeName, attributeValue) {
      this.attributeName = attributeName;
      this.attributeValue = attributeValue;
  }
  element(element) {
      element.setAttribute(this.attributeName, this.attributeValue);
  }
}

// Class to rewrite text within a HTML tag
class TextRewriter {
  constructor(newText) {
      this.newText = newText;
  }
  element(element) {
      element.setInnerContent(this.newText);
  }
}

// class to add tags ('a' tag in this case)
class addTag {
  constructor(tag) {
    this.tags = tag
  }
  
  element(element) {
	// prepend function adds the tag in the element that is specified ('links' in this case)
    element.prepend(this.tags, {html:true})
  }
}


