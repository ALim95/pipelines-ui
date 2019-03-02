const DARKNET = "alim95/darknet-test:v3";
const DARKNET_OPENCV = "alim95/darknet-test:opencv-v1";
var curr_component_num = 0;
var component_num = 0;
var new_component = 2;
var component_list = [];
$(document).ready(function(){
    $('.modal-background').click(function(){
        $(this).closest('.modal').removeClass('is-active');
    });
    $("#add-component-button").click(function(){
        curr_component_num++;
        component_list.push(component_num);
        $("#component-column").append(`
        <div class="notification" id="` + component_num + `">
        <button class="delete" id="delete-button` + component_num + `"></button>
        <div class="field">
            <label class="label">Name of component</label>
            <div class="control">
            <input id="component-name" class="input compulsory-info" type="text" placeholder="Text input"/>
            </div>
        </div>   
        <div class="field">
            <label class="label">Image to use</label>
            <div class="control">
            <div class="select">
                <select class="compulsory-info" id="component-image"
                ><option>Select image</option
                ><option>Darknet(No OpenCV)</option
                ><option>Darknet(OpenCV)</option></select
                >
            </div>
            </div>
        </div> 
        <div class="field">
            <label class="label">Command to run in container</label>
            <div class="control">
            <input id="component-command" class="input" type="text" placeholder="Text input"/>
            </div>
        </div>       
        <label class="label">Output of component</label>   
        <div class="field is-horizontal">
            <div class="field-body">
            <div class="field">
                <label class="label">Label</label>
            </div>
            <div class="field">
                <label class="label">File</label>
            </div>
            </div>
        </div>
        <div class="field is-horizontal">
            <div class="field-body">
            <div class="field">
                <p class="control is-expanded">
                <input id="component-output-label0" class="input" type="text" placeholder="Text input">
                </p>
            </div>
            <div class="field">
                <p class="control is-expanded">
                <input id="component-output-file0" class="input" type="text" placeholder="Text input">
                </p>
            </div>
            </div>
        </div>
        <div class="field is-horizontal">
            <div class="field-body">
            <div class="field">
                <p class="control is-expanded">
                <input id="component-output-label1" class="input" type="text" placeholder="Text input">
                </p>
            </div>
            <div class="field">
                <p class="control is-expanded">
                <input id="component-output-file1" class="input" type="text" placeholder="Text input">
                </p>
            </div>
            </div>
        </div>
        <div class="field is-horizontal">
            <div class="field-body">
            <div class="field">
                <p class="control is-expanded">
                <input id="component-output-label2" class="input" type="text" placeholder="Text input">
                </p>
            </div>
            <div class="field">
                <p class="control is-expanded">
                <input id="component-output-file2" class="input" type="text" placeholder="Text input">
                </p>
            </div>
            </div>
        </div>            
        </div>
    `);
        $('#delete-button' + component_num).click(function(){
        curr_component_num--;
        var index = $(this).closest('.notification').attr('id');
        arrayIndex = component_list.indexOf(parseInt(index));
        component_list.splice(arrayIndex,1);
        $(this).closest('.notification').remove();
        });          
        component_num++;
    });
    $("#generate-pipeline-button").click(function(){             
        var inputs_filled = true;
        if (curr_component_num == 0) {
            $(".modal").addClass('is-active');
            inputs_filled = false;
        }
        $(".compulsory-info").each(function(){
        if (this.value == "" || this.value == "Select image") {              
            inputs_filled = false;
            this.style = ("border: red 1px solid");
        } else {
            this.style =("border: ;");
        }
        })          
        if (inputs_filled == false){
        console.log("no info");
        } else {
        var component_name_arr = [];
        var arrayLength = component_list.length;
        var componentString = "";
        for (var i = 0; i < arrayLength; i++) {
        var component_name = $("#"+component_list[i]).find("#component-name").val();
        var component_image = $("#"+component_list[i]).find("#component-image").val();
        var component_command = $("#"+component_list[i]).find("#component-command").val();
        var component_output = "";
        var output_count = 0;
        for (var j=0; j <= 2; j++) {
            if ($("#"+component_list[i]).find("#component-output-label"+j.toString()).val() != "") {
            output_count++;
            }
        }

        for (var j=0; j <= 2; j++) {
            if (output_count == 0) break;
            else if (output_count ==1 ) {
            component_output += `'` + $("#"+component_list[i]).find("#component-output-label"+j.toString()).val() + `': '` + 
                                $("#"+component_list[i]).find("#component-output-file"+j.toString()).val() + `'`; break;
            } else {
            component_output += `'` + $("#"+component_list[i]).find("#component-output-label"+j.toString()).val() + `': '` + 
                                $("#"+component_list[i]).find("#component-output-file"+j.toString()).val() + `',`; output_count--;
            }
        }

        switch(component_image) {
            case "Darknet(No OpenCV)": component_image = DARKNET; break;
            case "Darknet(OpenCV)": component_image = DARKNET_OPENCV; break;
        }
    componentString += 
`
    ` + component_name + `=new_container(
        step_name='` + component_name + `',
        step_image='` + component_image + `',
        step_command='` + component_command + `',
        step_outputs={` + component_output + `},
        output_to_local='',
        component_directory_location=storage_maker.outputs['` + component_name + `']
    )
`;            
        component_name_arr.push(component_name);
        }
        var pipeline_directory_maker = "";
        var pipeline_output_maker = "";
        var pipeline_directory_location = "";
        for (var i = 0; i < component_name_arr.length; i++) {
        pipeline_directory_maker += ("mkdir /mnt/" + $("#pipeline-folder").val() + "/" + component_name_arr[i]);
        pipeline_output_maker += (`echo "/mnt/` + $("#pipeline-folder").val() + "/" + component_name_arr[i] + `" >> /` + component_name_arr[i] + `.txt`);
        pipeline_directory_location += (`'` + component_name_arr[i] + `': '/` + component_name_arr[i] + `.txt'`);
        if (i != component_name_arr.length - 1) {
            pipeline_directory_maker += " && ";
            pipeline_output_maker += " && "
            pipeline_directory_location += ", ";
        }
        }
        console.log("Directory maker:" + pipeline_directory_maker);
        console.log("Output maker:" + pipeline_output_maker);
        console.log("Directory Location:" + pipeline_directory_location);
        var dt = new Date();
        var timestamp = dt.getFullYear().toString() + (dt.getMonth()+1).toString() + dt.getDate().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString();
        $("#generated-timestamp").empty().append("on: " + dt + ` <a class="button is-info is-outlined is-small" id="copy-text-button">
        <span class="icon">
            <i class="far fa-clipboard"></i>
        </span>
        <span>Copy to clipboard</span>
      </a>`);        
        $("#generated-pipeline").empty()
        .append(
`<pre><code id="code-block" class="python">import kfp.dsl as dsl
from kubernetes import client as k8s_client

pv_name='` + $("#pipeline-pv").val() + `'
pvc_name='` + $("#pipeline-pvc").val() + `'

def storage_maker_op(folder_name='',step_name='make-storage'):
    container = dsl.ContainerOp(
        name=step_name,
        image='amd64/ubuntu:16.04',
        command = ['sh', '-c', ('mkdir /mnt/' + folder_name + ' && ` +  pipeline_directory_maker + ` && ` +  pipeline_output_maker + `')],
        file_outputs={` +  pipeline_directory_location + `}
    )
    container.add_volume(
        k8s_client.V1Volume(name=pv_name, persistent_volume_claim=k8s_client.V1PersistentVolumeClaimVolumeSource(
            claim_name=pvc_name)))
    container.add_volume_mount(k8s_client.V1VolumeMount(mount_path='/mnt', name=pv_name))
    return container

def new_container(step_name, step_image, step_command=None, step_arguments=None, step_outputs=None, output_to_local='', component_directory_location=''):
    if (output_to_local!=''):
        step_command = step_command + ' && cp ' + output_to_local + ' /mnt'
    container = dsl.ContainerOp(
		name=step_name,
		image=step_image,
		command=['sh', '-c', (step_command)],
		arguments=step_arguments,
		file_outputs=step_outputs
	  )
    container.add_volume(
        k8s_client.V1Volume(name=pv_name, persistent_volume_claim=k8s_client.V1PersistentVolumeClaimVolumeSource(
            claim_name=pvc_name)))
    container.add_volume_mount(k8s_client.V1VolumeMount(mount_path='/mnt', name=pv_name))
    return container
  
@dsl.pipeline(
    name='` + $("#pipeline-name").val() + `',
    description='` + $("#pipeline-description").val() + `'
)

def pipeline` +  timestamp + `(
        project='darknet-train',
        model='darknet-test/yolov3.weights',
        train_output='/darknet/predictions.jpg'):

    tf_server_name = 'pipeline` +  timestamp + `-{{workflow.name}}'

    storage_maker = storage_maker_op(folder_name='` + $("#pipeline-folder").val() + `')
`
+ 
    componentString
+
`
if __name__ == '__main__':
    import kfp.compiler as compiler

    compiler.Compiler().compile(pipeline` + timestamp + `, __file__ + '.tar.gz')
</code>
</pre>
    `);
    $('#copy-text-button').click(function () { copyFunction(); });
    }
    hljs.initHighlighting.called = false;
    hljs.initHighlighting();
    });
});

function copyFunction() {
    const copyText = document.getElementById("code-block").textContent;
    const textArea = document.createElement('textarea');
    textArea.textContent = copyText;
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
}