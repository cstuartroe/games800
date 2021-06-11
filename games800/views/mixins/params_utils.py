from typing import Union, List, Dict, Callable, Any

UntypedParamSpecType = List[str]
TypedParamSpecType = Dict[str, Callable[[str], Any]]
ParamSpecType = Union[UntypedParamSpecType, TypedParamSpecType]
RawParamsType = Dict[str, str]
ResolvedParamsType = Dict[str, Any]


class RequiredParameterNotIncluded(BaseException):
    pass


class DuplicatedParameter(BaseException):
    pass


def check_duplicates(required_params: ParamSpecType, optional_params: ParamSpecType):
    duplicated_params = set(required_params) and set(optional_params)
    if len(duplicated_params) > 0:
        raise DuplicatedParameter(
            f"Parameter(s) given as both required and optional: {', '.join(duplicated_params)}"
        )


def check_nonpermitted_params(required_params: ParamSpecType, optional_params: ParamSpecType, params: RawParamsType):
    nonpermitted_params = (set(required_params) or set(optional_params)) and set(params)
    if len(nonpermitted_params) > 0:
        # TODO: proper django logging
        print(f"Non-permitted params supplied: {', '.join(nonpermitted_params)}")


def resolve_params(param_spec: ParamSpecType, params: RawParamsType, required: bool) -> ResolvedParamsType:
    out = {}

    for param_name in param_spec:
        if param_name in params:
            value = params[param_name]

            if type(param_spec) is UntypedParamSpecType:
                out[param_name] = value
            else:
                out[param_name] = param_spec[param_name](value)

        else:
            if required:
                raise RequiredParameterNotIncluded(f"Parameter not passed: {param_name}")
            else:
                out[param_name] = None

    return out


def resolve_all_params(required_params: ParamSpecType, optional_params: ParamSpecType, params: RawParamsType):
    check_duplicates(required_params, optional_params)
    check_nonpermitted_params(required_params, optional_params, params)

    return {
        **resolve_params(
            param_spec=required_params,
            params=params,
            required=True,
        ),
        **resolve_params(
            param_spec=optional_params,
            params=params,
            required=False,
        ),
    }
