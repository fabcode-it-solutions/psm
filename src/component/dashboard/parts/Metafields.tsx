"use client";
import Dropdown from "@/component/ui/dashboard/Dropdown";
import { FormField } from "@/component/ui/dashboard/FormField";
import { TagSelect } from "@/component/ui/dashboard/TagSelect";
import { MetafieldDefinition } from "@/types/metafield.types";
import { Info, PlusCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import {
  addMetafield,
  updateMetafieldField,
} from "@/libs/redux/slices/partsSlice";
import { metafieldsService } from "@/services/metafields.service";
const Metafields = () => {
  const dispatch = useDispatch();
  const part = useSelector((state: RootState) => state.part.part);
  const metafields = useSelector(
    (state: RootState) => state.part.part?.proMetafields
  );
  const [availableMetafields, setAvailableMetafields] = useState<
    MetafieldDefinition[]
  >([]);
  const getMetafieldOptions = async () => {
    try {
      const result = await metafieldsService.getMetafieldDefinitions(
        "part",
        part?.categoryIds
      );
      setAvailableMetafields(result);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (availableMetafields.length > 0) {
      availableMetafields.map((item) => {
        dispatch(
          addMetafield({
            entityType: "part",
            metafieldDefinitionId: item.id,
          })
        );
      });
    }
  }, [availableMetafields]);
  useEffect(() => {
    getMetafieldOptions();
  }, [part?.categoryIds]);

  return (
    <div className="space-y-6">
      {availableMetafields.length === 0 && (
        <div className="text-center py-8 bg-gray-5/5 rounded-lg border-2 border-dashed border-gray-5/20">
          <p className="text-gray-4 text-sm font-sofia-sans">
            No metafields added yet.
          </p>
        </div>
      )}

      <div className="space-y-6 bg-gray-5/5 rounded-lg border border-gray-5/20">
        {availableMetafields.map((definition) => {
          const data = metafields?.find(
            (item) => item.metafieldDefinitionId == definition.id
          );
          const values =
            data?.valueArray &&
            data?.valueArray.map((item) => ({ label: item, value: item }));
          return (
            <div key={definition.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-start justify-between max-w-[250px] w-full">
                  <div>
                    <h4 className="font-medium text-light-100 font-sofia-sans">
                      {definition.name}
                      {definition.isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-4 font-sofia-sans mt-1">
                      Type: {definition.type} •{" "}
                      {definition.isRequired ? "Required" : "Optional"}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  {definition.type === "select" && (
                    <Dropdown
                      options={definition.options || []}
                      placeholder={definition.placeholder}
                      selectedText={
                        data?.valueText || String(data?.value) || ""
                      }
                      onValueChange={(e) => {
                        dispatch(
                          updateMetafieldField({
                            definitionId: definition.id,
                            key: "value",
                            value: e,
                          })
                        );
                      }}
                    />
                  )}
                  {definition.type === "multiselect" && (
                    <TagSelect
                      openOptions={true}
                      options={definition.options || []}
                      values={values}
                      placeholder={definition.placeholder}
                      selectMode="multiple"
                      setSelected={(e) => {
                        if (e.length > 0) {
                          const vals = e.map((item) => String(item.value));
                          dispatch(
                            updateMetafieldField({
                              definitionId: definition.id,
                              key: "value",
                              value: vals,
                            })
                          );
                        }
                      }}
                    />
                  )}
                  {definition.type === "text" && (
                    <FormField
                      placeholder={definition.placeholder}
                      type="text"
                      value={data?.valueText || ""}
                      onChange={(e) =>
                        dispatch(
                          updateMetafieldField({
                            definitionId: definition.id,
                            key: "value",
                            value: e.target.value,
                          })
                        )
                      }
                    />
                  )}
                  {definition.type === "number" && (
                    <FormField
                      placeholder={definition.placeholder}
                      type="number"
                      value={String(data?.valueNumber) || ""}
                      onChange={(e) =>
                        dispatch(
                          updateMetafieldField({
                            definitionId: definition.id,
                            key: "value",
                            value: e.target.value,
                          })
                        )
                      }
                    />
                  )}
                  {definition.type === "boolean" && (
                    <Switch.Root
                      onCheckedChange={(e) =>
                        dispatch(
                          updateMetafieldField({
                            definitionId: definition.id,
                            key: "value",
                            value: e,
                          })
                        )
                      }
                      checked={data?.valueBoolean ?? false}
                      className="w-11 h-6 bg-gray-5/20 rounded-full data-[state=checked]:bg-accent-100 transition-colors"
                    >
                      <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                  )}

                  {definition.helpText && (
                    <p className="text-xs text-gray-4 font-sofia-sans mt-1 flex items-center gap-1">
                      <Info width={16} /> {definition.helpText}
                    </p>
                  )}
                  {definition.description && (
                    <p className="text-xs text-gray-4 font-sofia-sans mt-1 flex items-center gap-1">
                      {definition.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(Metafields);
