import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { InvalidOrderStepError } from "../errors.js";

@Catch(InvalidOrderStepError)
export class InvalidOrderStepErrorFilter implements ExceptionFilter {
    catch(exception: InvalidOrderStepError, host: ArgumentsHost){
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        response.status(422).json({
            statusCode: 422,
            message: exception.message,
        });
    }
}