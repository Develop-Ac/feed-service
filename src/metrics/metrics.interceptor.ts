// metrics.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private histogram: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    // No Fastify o padrão da rota vem de `routeOptions.url`; `req.route.path`
    // era a API do Router do Express e não existe aqui.
    const rota = req.routeOptions?.url ?? req.url;
    const end = this.histogram.startTimer();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<FastifyReply>();
          end({
            method: req.method,
            route: rota,
            status_code: res.statusCode,
          });
        },
        error: () => {
          end({ method: req.method, route: rota, status_code: 500 });
        },
      }),
    );
  }
}