FB.init({ 
  appId: '1695158784080193',
  status: true, 
  cookie: true, 
  xfbml: true,
  version: 'v2.4'
});

var app = angular.module("FacebookEvents",[])

app.controller('EventsCtrl', function($scope) {
    
    		

			$scope.getEventDetails = function (index,group){
		    	console.log('details',index,group)
		    	var event = $scope.events[group][index];
		    	console.log(event)
				FB.api("/"+event.id,function(response){
			    	console.log(response)
			    	event.owner = response.owner.name
			    	$scope.$apply();
			    },{
			    	fields: "owner"
			    })
			}

    		$scope.getEvents = function(){ 
    			getEvents(function(events){
	    			$scope.events = events;
	    			$scope.$apply();
	    			['attending','not_replied'].forEach(function(group){
		    			$scope.events[group].forEach(function(event,index){
		    				$scope.getEventDetails(index,group)
		    			})
	    			});
	    		});
	    	}


    		
		    $scope.attend = function(event_id){
		    	FB.api("/"+event_id+"/attending",'post',function(response){
		    		console.log(response)
		    		$scope.getEvents();
		    	})
		    }

		    $scope.decline = function(event_id){
		    	FB.api("/"+event_id+"/declined",'post',function(response){
		    		console.log(response)
		    		$scope.getEvents();
		    	})
		    }

	FB.getLoginStatus(function(response){
		if (response.status === 'connected') {
    		$scope.getEvents();
		} else {
			FB.login(function(response){
		    	if(response.status === "connected"){
		    		$scope.getEvents();
		    	} else {
		    		console.error("Login failed...");
		    	}
		    },{scope: 'user_events,rsvp_event',return_scopes:true});
		}
	},true)	    


});



function getEvents(callback){
	var events = {};
	FB.api("/me/events",function(response){
    	console.log(response.data)
    	events.attending = response.data.filter(futureDates);
	    FB.api("/me/events",function(response){
	    	console.log(response.data)
	    	events.not_replied = response.data.filter(futureDates);
	    	callback(events);
	    },{
	    	type:'not_replied'
	    })
    })
}

function futureDates (event){
	var date = new Date(event.start_time);
	var today = new Date();
	today.setHours(0,0,0,0);
	if(date>today){
		return true;
	}
	return false;    	
}