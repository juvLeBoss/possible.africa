import React from "react";
import {
  useCan,
  useNavigation,
  useTranslate,
  useResource,
  useRouterContext,
  useRouterType,
  useLink,
} from "@refinedev/core";
import { EyeOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ShowButtonProps } from "@refinedev/antd";

/**
 * `<ShowButton>` uses Ant Design's {@link https://ant.design/components/button/ `<Button>`} component.
 * It uses the {@link https://refine.dev/docs/api-reference/core/hooks/navigation/useNavigation#show `show`} method from {@link https://refine.dev/docs/api-reference/core/hooks/navigation/useNavigation `useNavigation`} under the hood.
 * It can be useful when redirecting the app to the show page with the record id route of resource.
 *
 * @see {@link https://refine.dev/docs/api-reference/antd/components/buttons/show-button} for more details.
 */
export const ClickListPageElement: React.FC<ShowButtonProps> = ({
  resource: resourceNameFromProps,
  resourceNameOrRouteName: propResourceNameOrRouteName,
  recordItemId,
  hideText = false,
  accessControl,
  meta,
  children,
  onClick,
  ...rest
}) => {
  const accessControlEnabled = accessControl?.enabled ?? true;
  const hideIfUnauthorized = accessControl?.hideIfUnauthorized ?? false;
  const { showUrl: generateShowUrl } = useNavigation();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();

  const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  const translate = useTranslate();

  const { id, resource } = useResource(
    resourceNameFromProps ?? propResourceNameOrRouteName
  );

  const { data } = useCan({
    resource: resource?.name,
    action: "show",
    params: { id: recordItemId ?? id, resource },
    queryOptions: {
      enabled: accessControlEnabled,
    },
  });

  const createButtonDisabledTitle = () => {
    if (data?.can) return "";
    else if (data?.reason) return data.reason;
    else
      return translate(
        "buttons.notAccessTitle",
        "You don't have permission to access"
      );
  };

  const showUrl =
    resource && (recordItemId || id)
      ? generateShowUrl(resource, recordItemId! ?? id!, meta)
      : "";

  if (accessControlEnabled && hideIfUnauthorized && !data?.can) {
    return null;
  }

  return (
    <ActiveLink
      to={showUrl}
      replace={false}
      onClick={(e: React.PointerEvent<HTMLButtonElement>) => {
        if (data?.can === false) {
          e.preventDefault();
          return;
        }
        if (onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
        <Button {...rest}>{children}</Button>
    </ActiveLink>
  );
};