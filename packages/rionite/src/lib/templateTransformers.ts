import { NodeType, Template } from '../Template';

[['IfThen', 'rn-if-then'], ['IfElse', 'rn-if-else'], ['Repeat', 'rn-repeat']].forEach(
	([name, is]) => {
		Template.elementTransformers[name] = el => {
			if (name != 'Repeat') {
				let list = el.attributes!.list;

				if (list) {
					let index = list['length='] - 1;
					let foundIndex: number | undefined;

					for (; index >= 0; index--) {
						if (list[index].value == '') {
							foundIndex = index;
						} else if (list[index].name == 'if') {
							break;
						}
					}

					if (index == -1 && foundIndex !== undefined) {
						let attr = list[foundIndex];

						delete list[attr.name];
						list['if'] = foundIndex;

						list[foundIndex] = {
							isTransformer: false,
							name: 'if',
							value: attr.name,
							pos: -1
						};
					}
				}
			}

			return [
				{
					nodeType: NodeType.ELEMENT,
					isTransformer: false,
					nsSVG: el.nsSVG,
					tagName: 'template',
					is,
					names: el.names,
					attributes: el.attributes,
					$specifiedParams: null,
					events: null,
					domEvents: null,
					content: el.content,
					contentTemplateIndex: null
				}
			];
		};
	}
);

[['if', 'rn-if-then'], ['unless', 'rn-if-else'], ['for', 'rn-repeat']].forEach(([name, is]) => {
	Template.attributeTransformers[name] = (el, attr) => {
		return {
			nodeType: NodeType.ELEMENT,
			isTransformer: false,
			nsSVG: el.nsSVG,
			tagName: 'template',
			is,
			names: null,
			attributes: {
				attributeIsValue: is,
				list: {
					0: {
						isTransformer: false,
						name: name == 'unless' ? 'if' : name,
						value: attr.value,
						pos: -1
					},
					'length=': 1
				}
			},
			$specifiedParams: null,
			events: null,
			domEvents: null,
			content: [el],
			contentTemplateIndex: null
		};
	};
});
