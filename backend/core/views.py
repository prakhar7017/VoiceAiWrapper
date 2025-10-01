from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from graphene_django.views import GraphQLView
import logging

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(ratelimit(key='ip', rate='100/h', method='POST'), name='dispatch')
@method_decorator(ratelimit(key='ip', rate='1000/d', method='POST'), name='dispatch')
class RateLimitedGraphQLView(GraphQLView):
    """
    Custom GraphQL view with rate limiting and enhanced security
    """
    
    def dispatch(self, request, *args, **kwargs):
        # Log GraphQL requests
        if request.method == 'POST':
            logger.info(f"GraphQL request from {request.META.get('REMOTE_ADDR', 'unknown')}")
        
        return super().dispatch(request, *args, **kwargs)
    
    def execute_graphql_request(self, request, data, query, variables, operation_name, show_graphiql=False):
        """Override to add custom execution logic"""
        try:
            result = super().execute_graphql_request(
                request, data, query, variables, operation_name, show_graphiql
            )
            
            # Log errors if any
            if result and hasattr(result, 'errors') and result.errors:
                logger.error(f"GraphQL errors: {result.errors}")
            
            return result
        except Exception as e:
            logger.error(f"GraphQL execution error: {str(e)}")
            raise
